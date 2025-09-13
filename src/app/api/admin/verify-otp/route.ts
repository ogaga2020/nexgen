import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import crypto from 'crypto';
import logger from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
    const meta = { route: '/api/admin/verify-otp', method: 'POST' };
    try {
        await connectDB();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const admin = await Admin.findOne({ email: String(email).trim().toLowerCase() });
        if (!admin || !admin.otp) {
            logger.warn({ ...meta, email, reason: 'otp_not_found' });
            return NextResponse.json({ error: 'OTP not found' }, { status: 404 });
        }

        if (admin.otp.code !== otp) {
            logger.warn({ ...meta, email, reason: 'otp_invalid' });
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
        }

        const now = new Date();
        if (now > new Date(admin.otp.expires)) {
            logger.warn({ ...meta, email, reason: 'otp_expired' });
            return NextResponse.json({ error: 'OTP expired' }, { status: 410 });
        }

        const token = crypto.randomBytes(24).toString('hex');
        const rtExpires = new Date(Date.now() + 10 * 60 * 1000);

        admin.otp = undefined;
        admin.resetToken = { token, expires: rtExpires };
        await admin.save();

        const res = NextResponse.json({ message: 'OTP verified' });
        res.cookies.set('admin_reset_token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 10 * 60,
        });

        logger.info({ ...meta, email, status: 'otp_verified_cookie_set' });
        return res;
    } catch (e: any) {
        logger.error({ route: '/api/admin/verify-otp', method: 'POST', message: e?.message, stack: e?.stack });
        return NextResponse.json({ error: 'OTP verification failed' }, { status: 500 });
    }
}
