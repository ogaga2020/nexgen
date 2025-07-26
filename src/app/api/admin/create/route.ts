import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { sendMail } from '@/lib/email';
import { adminAccountCreated } from '@/lib/templates';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const { fullName, email, phone, password } = await req.json();

        const exists = await Admin.findOne({ email });
        if (exists) {
            return NextResponse.json({ error: 'Admin already exists' }, { status: 400 });
        }

        const hashed = await bcrypt.hash(password, 10);

        const newAdmin = await Admin.create({
            fullName,
            email,
            phone,
            password: hashed,
            role: 'editor',
        });

        await sendMail({
            to: email,
            subject: 'Your NexGen Admin Access',
            html: adminAccountCreated(fullName, email, phone, password),
        });

        return NextResponse.json({ message: 'Admin created successfully' });
    } catch (err) {
        console.error('[CREATE_ADMIN_POST_ERROR]', err);
        return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
    }
}
