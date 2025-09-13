import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { NextRequest, NextResponse } from 'next/server';
import { sendOtpTemplate } from '@/lib/templates';
import { sendMail } from '@/lib/email';
import { EMAIL_SUBJECTS } from '@/utils/constants';
import logger from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    const meta = { route: '/api/admin/forgot', method: 'POST' };
    try {
        await connectDB();
        const { email } = await req.json();

        if (!email) {
            logger.warn({ ...meta, reason: 'missing_email' });
            return NextResponse.json({ error: 'Missing email' }, { status: 400 });
        }

        const admin = await Admin.findOne({ email });
        if (!admin) {
            logger.warn({ ...meta, email, reason: 'admin_not_found' });
            return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const expires = new Date(Date.now() + 10 * 60 * 1000);

        admin.otp = { code: otp, expires };
        await admin.save();

        try {
            await sendMail({
                to: admin.email,
                subject: EMAIL_SUBJECTS.OTP_CODE,
                html: sendOtpTemplate(otp),
            });
            logger.info({ ...meta, email, status: 'otp_sent' });
        } catch (e: any) {
            logger.error({ ...meta, email, mail: 'send_failed', message: e?.message, stack: e?.stack });
        }

        return NextResponse.json({ message: 'OTP sent' });
    } catch (err: any) {
        logger.error({ route: '/api/admin/forgot', method: 'POST', message: err?.message, stack: err?.stack });
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
