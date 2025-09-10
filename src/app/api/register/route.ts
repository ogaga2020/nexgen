import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Registration from '@/models/Registration';

type TrainingDuration = 4 | 8 | 12;

const TUITION_BY_DURATION: Record<TrainingDuration, number> = {
    4: 250_000,
    8: 450_000,
    12: 700_000,
};

const WHATSAPP_E164 = process.env.WHATSAPP_E164 || '2348039375634';

function fmtNaira(n: number) {
    return `₦${Number(n).toLocaleString()}`;
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
        intakeMonth,
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

    const tuition = TUITION_BY_DURATION[Number(trainingDuration) as TrainingDuration];
    const firstPayment = Math.round(tuition * 0.6);
    const balance = tuition - firstPayment;

    try {
        const doc = await Registration.create({
            fullName,
            email,
            phone,
            photo,
            trainingType,
            trainingDuration,
            intakeMonth,
            guarantor,
            verificationStatus: 'pending',
            tuition,
            firstPayment,
            balance,
        });

        const lines = [
            `Hello NexGen,`,
            `My name is ${fullName}.`,
            `Course: ${trainingType}`,
            `Duration: ${trainingDuration} months${intakeMonth ? ` (${intakeMonth})` : ''}`,
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
        if (e?.code === 11000) {
            return new NextResponse('A similar registration already exists.', { status: 409 });
        }
        console.error('Registration error:', e);
        return new NextResponse('Server error', { status: 500 });
    }
}
