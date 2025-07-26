import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        await connectDB();

        const data = await req.json();
        const {
            fullName,
            email,
            phone,
            photo,
            trainingType,
            trainingDuration,
            guarantor,
        }: {
            fullName: string;
            email: string;
            phone: string;
            photo: string;
            trainingType: 'Electrical' | 'Plumbing' | 'Solar';
            trainingDuration: 4 | 8 | 12;
            guarantor: {
                fullName: string;
                email: string;
                phone: string;
                photo: string;
            };
        } = data;

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: 'User already registered' }, { status: 409 });
        }

        const prices: Record<number, number> = {
            4: 400000,
            8: 800000,
            12: 1100000,
        };

        const totalCost = prices[trainingDuration];
        const initialPayment = Math.floor(totalCost * 0.6);

        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + trainingDuration);

        const user = await User.create({
            fullName,
            email,
            phone,
            photo,
            trainingType,
            trainingDuration,
            guarantor,
            dueDate,
            paymentStatus: 'not_paid',
        });

        return NextResponse.json({
            message: 'User registered. Proceed to Paystack payment.',
            userId: user._id,
            amount: initialPayment,
            totalCost,
        });
    } catch (err) {
        console.error('[REGISTER_POST_ERROR]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
