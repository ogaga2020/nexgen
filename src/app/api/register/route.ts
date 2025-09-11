import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

type TrainingDuration = 4 | 8 | 12;
type TrainingType = 'Electrical' | 'Plumbing' | 'Solar';

const TUITION_BY_DURATION: Record<TrainingDuration, number> = {
    4: 400_000,
    8: 800_000,
    12: 1_100_000,
};

const WHATSAPP_E164 = process.env.WHATSAPP_E164 || '2348039375634';

function fmtNaira(n: number) {
    return `₦${Number(n).toLocaleString()}`;
}

function addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

export async function POST(req: Request) {
    await connectDB();

    let body: any;
    try {
        body = await req.json();
    } catch {
        return new NextResponse('Invalid JSON body', { status: 400 });
    }

    const {
        fullName,
        email,
        phone,
        photo,
        trainingType,
        trainingDuration,
        guarantor,
    } = body || {};

    if (
        !fullName || !email || !phone || !photo ||
        !trainingType || !trainingDuration ||
        !guarantor?.fullName || !guarantor?.email || !guarantor?.phone || !guarantor?.photo
    ) {
        return new NextResponse('Missing required fields', { status: 400 });
    }

    if (![4, 8, 12].includes(Number(trainingDuration))) {
        return new NextResponse('Invalid trainingDuration', { status: 400 });
    }

    try {
        const tuition = TUITION_BY_DURATION[Number(trainingDuration) as TrainingDuration];
        const firstPayment = Math.round(tuition * 0.6);
        const balance = tuition - firstPayment;

        const doc = await User.create({
            fullName,
            email,
            phone,
            photo,
            trainingType: trainingType as TrainingType,
            trainingDuration: Number(trainingDuration) as TrainingDuration,
            guarantor,
            paymentStatus: 'not_paid',
            dueDate: addMonths(new Date(), Number(trainingDuration)),
            transactions: [],
        });

        const lines = [
            `Hello NexGen,`,
            `My name is ${fullName}.`,
            `Course: ${trainingType}`,
            `Duration: ${trainingDuration} months`,
            `First payment (60%): ${fmtNaira(firstPayment)}`,
            ``,
            `Email: ${email}`,
            `Phone: ${phone}`,
            ``,
            `I just submitted my registration. Kindly confirm next steps.`,
        ];

        const text = lines.join('\n');
        const waUrl = `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;

        return NextResponse.json({
            id: doc._id.toString(),
            tuition,
            firstPayment,
            balance,
            waMessage: text,
            waUrl,
        });
    } catch (e: any) {
        console.error('Registration error:', e);
        if (e?.code === 11000) {
            return new NextResponse('A user with this email already exists.', { status: 409 });
        }
        return new NextResponse(e?.message || 'Server error', { status: 500 });
    }
}
