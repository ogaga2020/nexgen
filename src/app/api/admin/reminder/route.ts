import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendMail } from '@/lib/email';
import { EMAIL_SUBJECTS, MAIN_ADMIN_EMAIL } from '@/utils/constants';
import { twoWeeksToFinishReminderTemplate, adminTwoWeeksReminderTemplate } from '@/lib/templates';

export const runtime = 'nodejs';

export async function GET() {
    try {
        await connectDB();

        const today = new Date();
        const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const end = new Date(start);
        end.setDate(end.getDate() + 1);

        const twoWeeksAheadStart = new Date(start);
        twoWeeksAheadStart.setDate(twoWeeksAheadStart.getDate() + 14);
        const twoWeeksAheadEnd = new Date(end);
        twoWeeksAheadEnd.setDate(twoWeeksAheadEnd.getDate() + 14);

        const users = await User.find({
            paymentStatus: { $ne: 'fully_paid' },
            dueDate: { $gte: twoWeeksAheadStart, $lt: twoWeeksAheadEnd },
        })
            .select('fullName email trainingType dueDate')
            .lean();

        for (const u of users) {
            const dueStr = new Date(u.dueDate).toLocaleDateString();

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

        return NextResponse.json({ sent: users.length });
    } catch {
        return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
    }
}
