import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendMail } from '@/lib/email';
import { EMAIL_SUBJECTS, MAIN_ADMIN_EMAIL } from '@/utils/constants';
import { twoWeeksToFinishReminderTemplate, adminTwoWeeksReminderTemplate } from '@/lib/templates';

export const runtime = 'nodejs';

const TZ = 'Africa/Lagos';

function startOfDayInTZ(date: Date, timeZone: string) {
    const fmt = new Intl.DateTimeFormat('en-CA', {
        timeZone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
    });
    const parts = fmt.formatToParts(date);
    const y = Number(parts.find(p => p.type === 'year')!.value);
    const m = Number(parts.find(p => p.type === 'month')!.value);
    const d = Number(parts.find(p => p.type === 'day')!.value);
    return new Date(Date.UTC(y, m - 1, d, 0, 0, 0));
}

export async function GET() {
    try {
        await connectDB();

        const todayStart = startOfDayInTZ(new Date(), TZ);
        const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);

        const twoWeeksAheadStart = new Date(todayStart.getTime() + 14 * 24 * 60 * 60 * 1000);
        const twoWeeksAheadEnd = new Date(todayEnd.getTime() + 14 * 24 * 60 * 60 * 1000);

        const users = await User.find({
            paymentStatus: { $ne: 'fully_paid' },
            dueDate: { $gte: twoWeeksAheadStart, $lt: twoWeeksAheadEnd },
        })
            .select('fullName email trainingType dueDate')
            .lean();

        for (const u of users) {
            const dueStr = new Date(u.dueDate).toLocaleDateString('en-NG', { timeZone: TZ, year: 'numeric', month: 'long', day: 'numeric' });

            await sendMail({
                to: u.email,
                subject: EMAIL_SUBJECTS.INSTALLMENT_REMINDER,
                html: twoWeeksToFinishReminderTemplate(u.fullName, u.trainingType, dueStr),
            });

            await sendMail({
                to: MAIN_ADMIN_EMAIL,
                subject: EMAIL_SUBJECTS.INSTALLMENT_REMINDER_ADMIN,
                html: adminTwoWeeksReminderTemplate(u.fullName, u.trainingType, dueStr),
            });
        }

        return NextResponse.json({ sent: users.length, window: { twoWeeksAheadStart, twoWeeksAheadEnd }, tz: TZ });
    } catch {
        return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
    }
}
