import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();
        const count = await Admin.countDocuments();
        return NextResponse.json({ exists: count > 0 });
    } catch (err) {
        console.error('[ADMIN_CHECK_ERROR]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const existingCount = await Admin.countDocuments();
        if (existingCount > 0) {
            return NextResponse.json({ error: 'Admin already exists' }, { status: 403 });
        }

        const { fullName, email, phone, password } = await req.json();
        const hashed = await bcrypt.hash(password, 10);

        const admin = await Admin.create({
            fullName,
            email,
            phone,
            password: hashed,
            role: 'superadmin',
        });

        return NextResponse.json({ message: 'Admin created', adminId: admin._id });
    } catch (err) {
        console.error('[ADMIN_CREATE_ERROR]', err);
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
