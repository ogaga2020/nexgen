import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';
import logger from '@/lib/logger';
import { sendMail } from '@/lib/email';
import { EMAIL_SUBJECTS } from '@/utils/constants';
import { welcomeAfterVerificationTemplate, paymentRecordedTemplate } from '@/lib/templates';

export const runtime = 'nodejs';

type TrainingDuration = 4 | 8 | 12;
const TUITION_BY_DURATION: Record<TrainingDuration, number> = {
    4: 400_000,
    8: 800_000,
    12: 1_100_000,
};

function addMonths(date: Date, months: number) {
    const d = new Date(date);
    d.setMonth(d.getMonth() + months);
    return d;
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const id = params.id;

    let body: any;
    try {
        body = await req.json();
    } catch {
        return new NextResponse('Invalid JSON body', { status: 400 });
    }

    try {
        const user = await User.findById(id);
        if (!user) return new NextResponse('Not found', { status: 404 });

        const updates: any = {};

        if (typeof body.fullName === 'string') updates.fullName = body.fullName;
        if (typeof body.email === 'string') updates.email = body.email;
        if (typeof body.phone === 'string') updates.phone = body.phone;
        if (typeof body.photo === 'string') updates.photo = body.photo;
        if (body.guarantor && typeof body.guarantor === 'object') {
            updates.guarantor = {
                fullName: body.guarantor.fullName ?? user.guarantor.fullName,
                email: body.guarantor.email ?? user.guarantor.email,
                phone: body.guarantor.phone ?? user.guarantor.phone,
                photo: body.guarantor.photo ?? user.guarantor.photo,
            };
        }

        if (typeof body.verificationStatus === 'string') {
            updates.verificationStatus = body.verificationStatus === 'verified' ? 'verified' : 'unverified';

            if (updates.verificationStatus === 'verified' && user.paymentStatus === 'not_paid') {
                const startDate = body.startDate ? new Date(body.startDate) : new Date();
                const dueDate = addMonths(startDate, user.trainingDuration);

                updates.paymentStatus = 'partially_paid';
                updates.startDate = startDate;
                updates.dueDate = dueDate;

                const flip = await Transaction.updateMany(
                    { userId: user._id, type: 'initial', status: 'pending' },
                    { $set: { status: 'success' } }
                );

                logger.info({ route: '/api/admin/users/[id]', phase: 'verify_flip_tx', id, flipped: flip.modifiedCount });

                const startStr = startDate.toLocaleDateString();
                const dueStr = dueDate.toLocaleDateString();

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
                });

                await sendMail({
                    to: user.email,
                    subject: EMAIL_SUBJECTS.PAYMENT_RECORDED,
                    html: paymentRecordedTemplate(
                        user.fullName,
                        Math.round(TUITION_BY_DURATION[user.trainingDuration] * 0.6),
                        user.trainingType,
                        'Initial'
                    ),
                });
            }
        }

        if (body.markFullyPaid === true || body.paymentStatus === 'fully_paid') {
            updates.paymentStatus = 'fully_paid';

            const tuition = TUITION_BY_DURATION[user.trainingDuration];
            const balanceAmount = tuition - Math.round(tuition * 0.6);

            await Transaction.updateMany(
                { userId: user._id, type: 'initial', status: 'pending' },
                { $set: { status: 'success' } }
            );

            const existingBalance = await Transaction.findOne({ userId: user._id, type: 'balance' }).sort({ createdAt: -1 });

            if (!existingBalance) {
                await Transaction.create({
                    userId: user._id,
                    amount: balanceAmount,
                    type: 'balance',
                    reference: `BAL-${Date.now()}`,
                    status: 'success',
                });
            } else if (existingBalance.status === 'pending') {
                existingBalance.status = 'success';
                if (!existingBalance.amount || existingBalance.amount !== balanceAmount) {
                    existingBalance.amount = balanceAmount;
                }
                await existingBalance.save();
            }
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ ok: true, user });
        }

        const updated = await User.findByIdAndUpdate(id, updates, { new: true });
        logger.info({ route: '/api/admin/users/[id]', phase: 'patched', id, updates });

        if (updates.paymentStatus === 'fully_paid') {
            const { fullyPaidCongratulationsTemplate } = await import('@/lib/templates');
            await sendMail({
                to: (updated?.email as string) || user.email,
                subject: 'Congratulations! You are fully paid',
                html: fullyPaidCongratulationsTemplate(
                    updated?.fullName || user.fullName,
                    updated?.trainingType || user.trainingType
                ),
            });
        }

        return NextResponse.json({ ok: true, user: updated });
    } catch (e: any) {
        logger.error({ route: '/api/admin/users/[id]', phase: 'error', id, message: e?.message, stack: e?.stack });
        return new NextResponse('Server error', { status: 500 });
    }
}
