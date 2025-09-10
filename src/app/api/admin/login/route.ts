import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const COOKIE_NAME = process.env.ADMIN_COOKIE_NAME;
const MAX_AGE_SECONDS = parseInt(process.env.ADMIN_COOKIE_MAX_AGE, 10);

export async function POST(req: NextRequest) {
    try {
        await connectDB();

        const body = await req.json().catch(() => null);
        if (!body?.email || !body?.password) {
            return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
        }

        const email = String(body.email).toLowerCase().trim();
        const password = String(body.password);

        const admin = await Admin.findOne({ email });
        if (!admin) {
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        const ok = await bcrypt.compare(password, admin.password);
        if (!ok) {
            return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
        }

        admin.lastLoggedIn = new Date();
        await admin.save();

        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return NextResponse.json({ error: 'Server misconfigured (JWT_SECRET missing)' }, { status: 500 });
        }

        const token = jwt.sign(
            { id: admin._id.toString(), email: admin.email, role: admin.role || 'editor' },
            secret,
            { expiresIn: `${MAX_AGE_SECONDS}s` }
        );

        const res = NextResponse.json({ message: 'Login successful' });

        res.cookies.set(COOKIE_NAME, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: MAX_AGE_SECONDS,
            path: '/',
        });

        return res;
    } catch (err) {
        console.error('[ADMIN_LOGIN_ERROR]', err);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
