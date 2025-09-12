import { NextResponse } from 'next/server'
import { connectDB } from '@/lib/db'
import User from '@/models/User'
import Transaction from '@/models/Transaction'
import logger from '@/lib/logger'
import { sendMail } from '@/lib/email'
import { EMAIL_SUBJECTS, ADMIN_EMAILS_TO } from '@/utils/constants'
import { welcomeAfterVerificationTemplate, paymentRecordedTemplate } from '@/lib/templates'

export const runtime = 'nodejs'

type TrainingDuration = 4 | 8 | 12
const TUITION_BY_DURATION: Record<TrainingDuration, number> = {
    4: 250_000,
    8: 450_000,
    12: 700_000
}

function addMonths(date: Date, months: number) {
    const d = new Date(date)
    d.setMonth(d.getMonth() + months)
    return d
}

export async function GET(_: Request, { params }: { params: { id: string } }) {
    await connectDB()
    const user = await User.findById(params.id).lean()
    if (!user) return new NextResponse('Not found', { status: 404 })
    const tx = await Transaction.find({ userId: user._id }).sort({ createdAt: 1 }).lean()
    return NextResponse.json({ user, transactions: tx })
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
    await connectDB()
    const user = await User.findById(params.id)
    if (!user) return new NextResponse('Not found', { status: 404 })
    await Transaction.deleteMany({ userId: user._id })
    await User.findByIdAndDelete(user._id)
    return NextResponse.json({ ok: true })
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    await connectDB()
    const id = params.id

    let body: any
    try { body = await req.json() } catch { return new NextResponse('Invalid JSON body', { status: 400 }) }

    try {
        const user = await User.findById(id)
        if (!user) return new NextResponse('Not found', { status: 404 })

        const updates: any = {}

        if (typeof body.fullName === 'string') updates.fullName = body.fullName
        if (typeof body.email === 'string') updates.email = body.email
        if (typeof body.phone === 'string') updates.phone = body.phone
        if (typeof body.photo === 'string') updates.photo = body.photo
        if (body.guarantor && typeof body.guarantor === 'object') {
            updates.guarantor = {
                fullName: body.guarantor.fullName ?? user.guarantor.fullName,
                email: body.guarantor.email ?? user.guarantor.email,
                phone: body.guarantor.phone ?? user.guarantor.phone,
                photo: body.guarantor.photo ?? user.guarantor.photo,
            }
        }

        if (typeof body.verificationStatus === 'string') {
            updates.verificationStatus = body.verificationStatus === 'verified' ? 'verified' : 'unverified'

            if (updates.verificationStatus === 'verified' && user.paymentStatus === 'not_paid') {
                const startDate = body.startDate ? new Date(body.startDate) : new Date()
                const dueDate = addMonths(startDate, user.trainingDuration)

                updates.paymentStatus = 'partially_paid'
                updates.startDate = startDate
                updates.dueDate = dueDate

                await Transaction.updateMany(
                    { userId: user._id, type: 'initial', status: 'pending' },
                    { $set: { status: 'success' } }
                )

                const startStr = startDate.toLocaleDateString()
                const dueStr = dueDate.toLocaleDateString()

                await sendMail({
                    to: user.email,
                    subject: EMAIL_SUBJECTS.WELCOME_VERIFIED,
                    html: welcomeAfterVerificationTemplate(
                        user.fullName,
                        user.trainingType,
                        user.trainingDuration,
                        startStr,
                        dueStr
                    ),
                })

                await sendMail({
                    to: ADMIN_EMAILS_TO,
                    subject: EMAIL_SUBJECTS.PAYMENT_RECORDED,
                    html: paymentRecordedTemplate(
                        user.fullName,
                        Math.round(TUITION_BY_DURATION[user.trainingDuration] * 0.6),
                        user.trainingType,
                        'Initial',
                        'admin'
                    ),
                })
            }
        }

        if (body.markFullyPaid === true || body.paymentStatus === 'fully_paid') {
            updates.paymentStatus = 'fully_paid'

            const tuition = TUITION_BY_DURATION[user.trainingDuration as TrainingDuration]
            const expectedInitial = Math.round(tuition * 0.6)
            const expectedBalance = tuition - expectedInitial

            await Transaction.updateOne(
                { userId: user._id, type: 'initial' },
                { $set: { amount: expectedInitial, status: 'success' } }
            )

            const balanceTx = await Transaction.findOne({ userId: user._id, type: 'balance' }).sort({ createdAt: 1 })
            if (balanceTx) {
                balanceTx.amount = expectedBalance
                balanceTx.status = 'success'
                await balanceTx.save()
            } else {
                await Transaction.create({
                    userId: user._id,
                    amount: expectedBalance,
                    type: 'balance',
                    reference: `BAL-${Date.now()}`,
                    status: 'success',
                })
            }

            await sendMail({
                to: ADMIN_EMAILS_TO,
                subject: EMAIL_SUBJECTS.PAYMENT_RECORDED,
                html: paymentRecordedTemplate(user.fullName, expectedBalance, user.trainingType, 'Balance', 'admin'),
            })
        }

        if (Object.keys(updates).length === 0) return NextResponse.json({ ok: true, user })

        const updated = await User.findByIdAndUpdate(id, updates, { new: true })
        if (updates.paymentStatus === 'fully_paid') {
            const { fullyPaidCongratulationsTemplate } = await import('@/lib/templates')
            await sendMail({
                to: (updated?.email as string) || user.email,
                subject: EMAIL_SUBJECTS.FULLY_PAID_CONGRATS,
                html: fullyPaidCongratulationsTemplate(updated?.fullName || user.fullName, updated?.trainingType || user.trainingType),
            })
        }
        return NextResponse.json({ ok: true, user: updated })
    } catch (e: any) {
        logger.error({ route: '/api/admin/users/[id]', phase: 'error', id, message: e?.message, stack: e?.stack })
        return new NextResponse('Server error', { status: 500 })
    }
}
