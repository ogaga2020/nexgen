import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export const runtime = 'nodejs';

const PRICES: Record<number, number> = { 4: 400000, 8: 800000, 12: 1100000 };

const PaystackEventSchema = z.object({
    event: z.string(),
    data: z.object({
        reference: z.string(),
        amount: z.number(),
        customer: z.object({ email: z.string().email() }).partial()
    })
});

type AggSum = { _id: null; total: number };

function verifySignature(raw: string, headers: Headers): boolean {
    const secret = process.env.PAYSTACK_SECRET_KEY ?? '';
    if (!secret) return false;
    const received = headers.get('x-paystack-signature');
    if (!received) return false;
    const expected = crypto.createHmac('sha512', secret).update(raw).digest('hex');
    return expected === received;
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const raw = await req.text();

        if (process.env.NODE_ENV === 'production') {
            if (!verifySignature(raw, req.headers)) {
                return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
            }
        }

        const parse = PaystackEventSchema.safeParse(JSON.parse(raw));
        if (!parse.success) {
            return NextResponse.json({ received: true });
        }

        const { event, data } = parse.data;
        const reference = data.reference;
        const amountKobo = data.amount ?? 0;
        const email = data.customer?.email ?? '';

        if (!event || !reference) {
            return NextResponse.json({ received: true });
        }

        if (event === 'charge.failed') {
            const exists = await Transaction.findOne({ reference }).lean().exec();
            if (!exists) {
                const user = email ? await User.findOne({ email }).lean().exec() : null;
                await Transaction.create({
                    userId: user?._id,
                    amount: Math.floor(amountKobo / 100),
                    type: 'initial',
                    paymentMethod: 'Paystack',
                    reference,
                    status: 'failed'
                });
            }
            return NextResponse.json({ received: true });
        }

        if (event !== 'charge.success') {
            return NextResponse.json({ received: true });
        }

        const already = await Transaction.findOne({ reference }).lean().exec();
        if (already) return NextResponse.json({ message: 'Already processed' });

        const user = email ? await User.findOne({ email }).exec() : null;
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const paidBeforeAgg = (await Transaction.aggregate<AggSum>([
            { $match: { userId: user._id, status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])) as AggSum[];
        const paidBefore = paidBeforeAgg[0]?.total ?? 0;

        const amount = Math.floor(amountKobo / 100);
        const paymentType: 'initial' | 'balance' = paidBefore === 0 ? 'initial' : 'balance';

        await Transaction.create({
            userId: user._id,
            amount,
            type: paymentType,
            paymentMethod: 'Paystack',
            reference,
            status: 'success'
        });

        const totalAgg = (await Transaction.aggregate<AggSum>([
            { $match: { userId: user._id, status: 'success' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
        ])) as AggSum[];
        const totalPaid = totalAgg[0]?.total ?? 0;

        const programTotal = PRICES[(user as any).trainingDuration as number] ?? 0;

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
