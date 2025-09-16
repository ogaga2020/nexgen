import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { sendMail } from '@/lib/email';
import { adminAccountCreated } from '@/lib/templates';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BodySchema = z.object({
    fullName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().min(6),
    password: z.string().min(6),
});

export async function GET() {
    try {
        await connectDB();
        const count = await Admin.estimatedDocumentCount();
        return NextResponse.json(
            { exists: count > 0 },
            { headers: { 'Cache-Control': 'no-store' } }
        );
    } catch {
        return NextResponse.json(
            { error: 'Failed to check' },
            { status: 500, headers: { 'Cache-Control': 'no-store' } }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const json = await req.json().catch(() => null);
        const parsed = BodySchema.safeParse(json);
        if (!parsed.success) {
            const msg = parsed.error.issues.map((i) => i.message).join(', ');
            return NextResponse.json({ error: msg || 'Invalid request' }, { status: 400 });
        }

        const { fullName, email, phone, password } = parsed.data;
        const emailNorm = email.toLowerCase().trim();

        const exists = await Admin.findOne({ email: emailNorm }).lean().exec();
        if (exists) {
            return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 10);
        await Admin.create({
            fullName,
            email: emailNorm,
            phone,
            password: hashed,
            role: 'editor',
        });

        try {
            await sendMail({
                to: emailNorm,
                subject: 'Your NexGen Admin Access',
                html: adminAccountCreated(fullName, emailNorm, phone),
            });
        } catch { }

        return NextResponse.json({ ok: true, message: 'Admin created successfully' });
    } catch {
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
}
