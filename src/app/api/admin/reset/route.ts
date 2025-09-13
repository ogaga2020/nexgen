import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { sendMail } from '@/lib/email';
import { EMAIL_SUBJECTS } from '@/utils/constants';
import { resetSuccessTemplate } from '@/lib/templates';
import logger from '@/lib/logger';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  return NextResponse.json({ ok: true, route: '/api/admin/reset' }, { headers: { 'cache-control': 'no-store' } });
}

export async function POST(req: NextRequest) {
  const meta = { route: '/api/admin/reset', method: 'POST' };
  try {
    await connectDB();
    const { email, password, confirm } = await req.json();
    const cookieToken = req.cookies.get('admin_reset_token')?.value || '';

    if (!email || !password || !confirm) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }
    if (!cookieToken) {
      logger.warn({ ...meta, email, reason: 'missing_cookie_token' });
      return NextResponse.json({ error: 'Missing reset token' }, { status: 401 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (password !== confirm) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const emailLower = String(email).trim().toLowerCase();
    const admin = await Admin.findOne({ email: emailLower });
    if (!admin || !admin.resetToken) {
      logger.warn({ ...meta, email: emailLower, reason: 'reset_token_not_found' });
      return NextResponse.json({ error: 'Reset token not found' }, { status: 404 });
    }
    if (admin.resetToken.token !== cookieToken) {
      logger.warn({ ...meta, email: emailLower, reason: 'reset_token_invalid' });
      return NextResponse.json({ error: 'Invalid reset token' }, { status: 401 });
    }
    if (new Date() > new Date(admin.resetToken.expires)) {
      logger.warn({ ...meta, email: emailLower, reason: 'reset_token_expired' });
      return NextResponse.json({ error: 'Reset token expired' }, { status: 410 });
    }

    const hash = await bcrypt.hash(password, 10);
    admin.password = hash;
    admin.resetToken = undefined;
    await admin.save();

    try {
      await sendMail({
        to: admin.email,
        subject: EMAIL_SUBJECTS.RESET_SUCCESS,
        html: resetSuccessTemplate(),
      });
      logger.info({ ...meta, email: emailLower, mail: 'reset_success_sent' });
    } catch (e: any) {
      logger.error({ ...meta, email: emailLower, mail: 'send_failed', message: e?.message, stack: e?.stack });
    }

    const res = NextResponse.json({ message: 'Password reset successful' }, { headers: { 'cache-control': 'no-store' } });
    res.cookies.set('admin_reset_token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 0,
    });

    logger.info({ ...meta, email: emailLower, status: 'success' });
    return res;
  } catch (err: any) {
    logger.error({ route: '/api/admin/reset', method: 'POST', message: err?.message, stack: err?.stack });
    return NextResponse.json({ error: 'Password reset failed' }, { status: 500 });
  }
}
