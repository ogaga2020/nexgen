import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import logger from '@/lib/logger';
import { randomUUID } from 'crypto';

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

function redactBody(raw: any) {
    if (!raw) return raw;
    const clone: any = { ...raw };
    if (clone.photo) clone.photo = '[url]';
    if (clone?.guarantor?.photo) clone.guarantor.photo = '[url]';
    if (clone.password) clone.password = '***REDACTED***';
    return clone;
}

export async function POST(req: Request) {
    const requestId = randomUUID();
    const startedAt = Date.now();

    try {
        await connectDB();
        logger.info({ requestId, route: '/api/register', phase: 'db_connected' });
    } catch (e: any) {
        logger.error({
            requestId,
            route: '/api/register',
            phase: 'db_connect_error',
            message: e?.message,
            stack: e?.stack,
        });
        return new NextResponse('Database connection failed', { status: 500 });
    }

    let body: any;
    try {
        body = await req.json();
        logger.info({
            requestId,
            route: '/api/register',
            phase: 'input',
            body: redactBody(body),
        });
    } catch {
        logger.warn({ requestId, route: '/api/register', phase: 'bad_json' });
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
        logger.warn({
            requestId,
            route: '/api/register',
            phase: 'validation',
            msg: 'Missing required fields',
        });
        return new NextResponse('Missing required fields', { status: 400 });
    }

    if (![4, 8, 12].includes(Number(trainingDuration))) {
        logger.warn({
            requestId,
            route: '/api/register',
            phase: 'validation',
            msg: 'Invalid trainingDuration',
            trainingDuration,
        });
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
            `Hello NexGen Admin,`,
            ``,
            `My name is ${fullName}.`,
            `I just submitted my registration for training.`,
            ``,
            `Course: ${trainingType}`,
            `Duration: ${trainingDuration} months`,
            `Total Tuition: ${fmtNaira(tuition)}`,
            `First Payment (60%): ${fmtNaira(firstPayment)}`,
            `Balance (40%): ${fmtNaira(balance)}`,
            ``,
            `Email: ${email}`,
            `Phone: ${phone}`,
            ``,
            `Please share your bank/payment details so I can make the first payment and continue the process.`,
        ];

        const text = lines.join('\n');
        const waUrl = `https://wa.me/${WHATSAPP_E164}?text=${encodeURIComponent(text)}`;

        logger.info({
            requestId,
            route: '/api/register',
            phase: 'success',
            userId: doc._id.toString(),
            durationMs: Date.now() - startedAt,
        });

        return NextResponse.json({
            id: doc._id.toString(),
            tuition,
            firstPayment,
            balance,
            waMessage: text,
            waUrl,
        });
    } catch (e: any) {
        const payload = {
            requestId,
            route: '/api/register',
            phase: 'error',
            durationMs: Date.now() - startedAt,
            message: e?.message,
            name: e?.name,
            code: e?.code,
            stack: e?.stack,
        };
        logger.error(payload);

        if (e?.code === 11000) {
            return new NextResponse('A user with this email already exists.', { status: 409 });
        }

        const isDev = process.env.NODE_ENV !== 'production';
        return new NextResponse(isDev ? (e?.message || 'Server error') : 'Server error', { status: 500 });
    }
}
