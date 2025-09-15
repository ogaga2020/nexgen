import { connectDB } from '@/lib/db'
import Admin from '@/models/Admin'
import { NextRequest, NextResponse } from 'next/server'
import { sendOtpTemplate } from '@/lib/templates'
import { sendMail } from '@/lib/email'
import { EMAIL_SUBJECTS } from '@/utils/constants'
import logger from '@/lib/logger'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function POST(req: NextRequest) {
    const meta = { route: '/api/admin/forgot', method: 'POST' }

    if (!process.env.MONGODB_URI) {
        logger.error({ ...meta, phase: 'env', error: 'MONGODB_URI missing' })
        return NextResponse.json({ error: 'MONGODB_URI not set on server' }, { status: 500 })
    }

    let email = ''
    try {
        const body = await req.json()
        email = (body?.email || '').trim()
        if (!email) return NextResponse.json({ error: 'Missing email' }, { status: 400 })
    } catch (e: any) {
        logger.error({ ...meta, phase: 'parse_body', message: e?.message })
        return NextResponse.json({ error: 'Bad JSON' }, { status: 400 })
    }

    try {
        await connectDB()
    } catch (e: any) {
        logger.error({ ...meta, phase: 'db_connect', message: e?.message, stack: e?.stack })
        return NextResponse.json({ error: 'DB connect failed' }, { status: 500 })
    }

    try {
        const admin = await Admin.findOne({ email })
        if (!admin) return NextResponse.json({ error: 'Admin not found' }, { status: 404 })

        const otp = Math.floor(100000 + Math.random() * 900000).toString()
        const expires = new Date(Date.now() + 10 * 60 * 1000)

        admin.otp = { code: otp, expires }
        await admin.save()

        try {
            await sendMail({
                to: admin.email,
                subject: EMAIL_SUBJECTS.OTP_CODE,
                html: sendOtpTemplate(otp),
            })
            logger.info({ ...meta, email, status: 'otp_sent' })
        } catch (e: any) {
            logger.error({ ...meta, email, phase: 'send_mail', message: e?.message })
        }

        return NextResponse.json({ message: 'OTP sent' })
    } catch (e: any) {
        logger.error({ ...meta, phase: 'db_ops', message: e?.message, stack: e?.stack })
        return NextResponse.json({ error: 'Server error' }, { status: 500 })
    }
}
