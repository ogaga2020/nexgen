import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { sendMail } from '@/lib/email';
import { adminAccountCreated } from '@/lib/templates';
import { getCurrentAdmin } from '@/lib/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const BodySchema = z.object({
    fullName: z.string().min(1, 'Full name is required'),
    email: z.string().email('Valid email required'),
    phone: z.string().min(6, 'Phone is required'),
    password: z.string().min(6, 'Password must be at least 6 chars'),
});

export async function GET() {
    try {
        await connectDB();
        const count = await Admin.estimatedDocumentCount();
        return NextResponse.json({ exists: count > 0 }, { headers: { 'Cache-Control': 'no-store' } });
    } catch {
        return NextResponse.json({ error: 'Failed to check' }, { status: 500, headers: { 'Cache-Control': 'no-store' } });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const json = await req.json().catch(() => null);
        const parsed = BodySchema.safeParse(json);
        if (!parsed.success) {
            const msg = parsed.error.issues.map((i) => i.message).join(', ');
            return NextResponse.json({ ok: false, message: msg || 'Invalid request' }, { status: 400 });
        }

        const { fullName, email, phone, password } = parsed.data;
        const emailNorm = email.toLowerCase().trim();

        const existsByEmail = await Admin.findOne({ email: emailNorm }).lean().exec();
        if (existsByEmail) {
            return NextResponse.json({ ok: false, message: 'Admin with this email already exists' }, { status: 409 });
        }

        const count = await Admin.estimatedDocumentCount();

        if (count === 0) {
            const hashed = await bcrypt.hash(password, 10);
            await Admin.create({
                fullName,
                email: emailNorm,
                phone,
                password: hashed,
                role: 'superadmin',
            });

            try {
                await sendMail({
                    to: emailNorm,
                    subject: 'Your NexGen Admin Access',
                    html: adminAccountCreated(fullName, emailNorm, phone),
                });
            } catch { }

            return NextResponse.json({ ok: true, message: 'First admin created (superadmin)' });
        }

        const current = await getCurrentAdmin();
        if (!current) {
            return NextResponse.json({ ok: false, message: 'Unauthorized' }, { status: 401 });
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

        return NextResponse.json({ ok: true, message: 'Admin created (editor)' });
    } catch {
        return NextResponse.json({ ok: false, message: 'Failed to create admin' }, { status: 500 });
    }
}
