import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { NextRequest, NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET() {
    try {
        await connectDB();
        const count = await Admin.countDocuments();
        logger.info({ route: '/api/admin', method: 'GET', exists: count > 0 });
        return NextResponse.json({ exists: count > 0 });
    } catch (err: any) {
        logger.error({ route: '/api/admin', method: 'GET', message: err?.message, stack: err?.stack });
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const existingCount = await Admin.countDocuments();
        if (existingCount > 0) {
            logger.warn({ route: '/api/admin', method: 'POST', message: 'Admin already exists' });
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

        logger.info({ route: '/api/admin', method: 'POST', adminId: String(admin._id), email });
        return NextResponse.json({ message: 'Admin created', adminId: admin._id });
    } catch (err: any) {
        logger.error({ route: '/api/admin', method: 'POST', message: err?.message, stack: err?.stack });
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
