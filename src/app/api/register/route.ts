import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
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
            guarantor: string;
        } = data;

        const existing = await User.findOne({ email });
        if (existing) {
            return NextResponse.json({ error: 'User already registered' }, { status: 409 });
        }

        // Estimate price for 60% initial payment
        const prices = {
            Electrical: { 4: 1350000, 8: 2600000, 12: 3400000 },
            Plumbing: { 4: 1200000, 8: 2400000, 12: 3100000 },
            Solar: { 4: 1400000, 8: 2800000, 12: 3600000 },
        };
        const totalCost = prices[trainingType][trainingDuration];
        const initialPayment = Math.floor(totalCost * 0.6);

        // Set due date based on duration
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + trainingDuration);

        // Create new user
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

        // You can optionally generate a Paystack payment reference here (we'll do it later)

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
