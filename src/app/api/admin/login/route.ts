import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, password } = await req.json();

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(password, admin.password);
        if (!isMatch) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }

        admin.lastLoggedIn = new Date();
        await admin.save();

        const token = jwt.sign(
            {
                id: admin._id,
                email: admin.email,
                role: admin.role,
            },
            process.env.JWT_SECRET!,
            { expiresIn: '7d' }
        );

        const res = NextResponse.json({ message: 'Login successful' });

        res.cookies.set('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60,
            path: '/',
        });

        return res;
    } catch (err) {
        console.error('[ADMIN_LOGIN_ERROR]', err);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
