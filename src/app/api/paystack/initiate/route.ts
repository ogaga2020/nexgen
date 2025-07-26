import { NextRequest, NextResponse } from 'next/server';
import { initiatePaystackPayment } from '@/lib/paystack';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { userId } = await req.json();

        const user = await User.findById(userId);
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const prices: Record<number, number> = {
            4: 400000,
            8: 800000,
            12: 1100000,
        };

        const totalCost = prices[user.trainingDuration];
        const amount = Math.floor(totalCost * 0.6);

        const reference = `NEXGEN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        const callbackUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/register/success?ref=${reference}`;

        const paymentData = await initiatePaystackPayment({
            email: user.email,
            amount,
            reference,
            callback_url: callbackUrl,
        });

        return NextResponse.json({
            authorization_url: paymentData.data.authorization_url,
            reference,
        });
    } catch (err) {
        console.error('[PAYSTACK_INITIATE_ERROR]', err);
        return NextResponse.json({ error: 'Payment setup failed' }, { status: 500 });
    }
}
