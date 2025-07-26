import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { NextRequest, NextResponse } from 'next/server';
import { sendOtpTemplate } from "@/lib/templates";
import { sendMail } from '@/lib/email';

export async function POST(req: NextRequest) {
    await connectDB();
    const { email } = await req.json();

    const admin = await Admin.findOne({ email });
    if (!admin) {
        return NextResponse.json({ error: 'Admin not found' }, { status: 404 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    admin.otp = { code: otp, expires };
    await admin.save();

    await sendMail({
        to: admin.email,
        subject: "Your OTP for Password Reset",
        html: sendOtpTemplate(otp),
    });

    return NextResponse.json({ message: 'OTP sent' });
}
