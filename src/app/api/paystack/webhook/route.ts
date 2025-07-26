import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json();

        if (body.event !== 'charge.success') {
            return NextResponse.json({ received: true });
        }

        const {
            reference,
            amount,
            customer: { email },
        } = body.data;

        if (process.env.NODE_ENV === 'production') {
            const rawBody = JSON.stringify(body);
            const secret = process.env.PAYSTACK_SECRET_KEY!;
            const hash = crypto
                .createHmac('sha512', secret)
                .update(rawBody)
                .digest('hex');

            const paystackSignature = req.headers.get('x-paystack-signature');

            if (hash !== paystackSignature) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const existingTx = await Transaction.findOne({ reference });
        if (existingTx) {
            return NextResponse.json({ message: 'Transaction already processed' });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const paidAmount = amount / 100;
        const prices: Record<number, number> = {
            4: 400000,
            8: 800000,
            12: 1100000,
        };
        const total = prices[user.trainingDuration];

        const paymentType: 'initial' | 'balance' =
            paidAmount >= total ? 'balance' : 'initial';

        const tx = await Transaction.create({
            userId: user._id,
            amount: paidAmount,
            type: paymentType,
            paymentMethod: 'Paystack',
            reference,
            status: 'success',
        });

        const totalPaid = await Transaction.aggregate([
            { $match: { userId: user._id, status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } },
        ]);

        const totalSoFar = totalPaid[0]?.total || 0;

        let status: 'not_paid' | 'partially_paid' | 'fully_paid' = 'not_paid';
        if (totalSoFar >= total) {
            status = 'fully_paid';
        } else if (totalSoFar > 0) {
            status = 'partially_paid';
        }

        user.paymentStatus = status;
        await user.save();

        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[WEBHOOK_ERROR]', err);
        return NextResponse.json({ error: 'Webhook failed' }, { status: 500 });
    }
}
