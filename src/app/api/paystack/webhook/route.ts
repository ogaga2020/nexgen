import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

const PRICES: Record<number, number> = { 4: 400000, 8: 800000, 12: 1100000 };

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const raw = await req.text();

        if (process.env.NODE_ENV === 'production') {
            const sig = req.headers.get('x-paystack-signature');
            const expected = crypto.createHmac('sha512', process.env.PAYSTACK_SECRET_KEY!).update(raw).digest('hex');
            if (!sig || sig !== expected) return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
        }

        const body = JSON.parse(raw);
        const event = body?.event;
        const data = body?.data || {};
        const reference: string = data?.reference;
        const amountKobo: number = data?.amount;
        const email: string = data?.customer?.email;

        if (!event || !reference) return NextResponse.json({ received: true });

        if (event === 'charge.failed') {
            const exists = await Transaction.findOne({ reference }).lean();
            if (!exists) {
                const user = email ? await User.findOne({ email }) : null;
                await Transaction.create({
                    userId: user?._id,
                    amount: Math.floor((amountKobo || 0) / 100),
                    type: 'initial',
                    paymentMethod: 'Paystack',
                    reference,
                    status: 'failed',
                });
            }
            return NextResponse.json({ received: true });
        }

        if (event !== 'charge.success') return NextResponse.json({ received: true });

        const already = await Transaction.findOne({ reference }).lean();
        if (already) return NextResponse.json({ message: 'Already processed' });

        const user = await User.findOne({ email });
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const paidBeforeAgg = await Transaction.aggregate([
            { $match: { userId: user._id, status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const paidBefore = paidBeforeAgg[0]?.total || 0;

        const amount = Math.floor((amountKobo || 0) / 100);
        const paymentType: 'initial' | 'balance' = paidBefore === 0 ? 'initial' : 'balance';

        await Transaction.create({
            userId: user._id,
            amount,
            type: paymentType,
            paymentMethod: 'Paystack',
            reference,
            status: 'success',
        });

        const totalAgg = await Transaction.aggregate([
            { $match: { userId: user._id, status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);
        const totalPaid = totalAgg[0]?.total || 0;
        const programTotal = PRICES[user.trainingDuration] || 0;

        let pStatus: 'not_paid' | 'partially_paid' | 'fully_paid' = 'not_paid';
        if (programTotal > 0 && totalPaid >= programTotal) pStatus = 'fully_paid';
        else if (totalPaid > 0) pStatus = 'partially_paid';

        user.paymentStatus = pStatus;
        await user.save();

        return NextResponse.json({ success: true });
    } catch {
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
