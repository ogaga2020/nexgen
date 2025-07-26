import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';

export async function POST(req: NextRequest) {
    try {
        await connectDB();
        const { email, otp } = await req.json();

        if (!email || !otp) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const admin = await Admin.findOne({ email });
        if (!admin || !admin.otp) {
            return NextResponse.json({ error: 'OTP not found' }, { status: 404 });
        }

        if (admin.otp.code !== otp) {
            return NextResponse.json({ error: 'Invalid OTP' }, { status: 401 });
        }

        const now = new Date();
        const expired = new Date(admin.otp.expires);
        if (now > expired) {
            return NextResponse.json({ error: 'OTP expired' }, { status: 410 });
        }

        admin.otp = undefined;
        await admin.save();

        return NextResponse.json({ message: 'OTP verified' });
    } catch (err) {
        console.error('[OTP_VERIFY_ERROR]', err);
        return NextResponse.json({ error: 'OTP verification failed' }, { status: 500 });
    }
}
