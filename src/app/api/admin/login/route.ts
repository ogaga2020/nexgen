import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const DEFAULT_COOKIE_NAME = '__admin_session';
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 14;

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
            return NextResponse.json({ error: 'Server misconfigured: JWT_SECRET missing' }, { status: 500 });
        }

        const cookieName = process.env.ADMIN_COOKIE_NAME || DEFAULT_COOKIE_NAME;
        const maxAge = Number(process.env.ADMIN_COOKIE_MAX_AGE) || DEFAULT_MAX_AGE;

        const token = jwt.sign(
            { id: admin._id.toString(), email: admin.email, role: admin.role || 'editor' },
            secret,
            { expiresIn: maxAge }
        );

        const res = NextResponse.json({ message: 'Login successful' });

        res.cookies.set(cookieName, token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge,
            path: '/',
        });

        return res;
    } catch (err: any) {
        console.error('[ADMIN_LOGIN_ERROR]', err?.message || err);
        return NextResponse.json({ error: 'Login failed' }, { status: 500 });
    }
}
