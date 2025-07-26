import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { sendMail } from '@/lib/email';
import {
    installmentReminderTemplate,
    installmentReminderAdmin,
} from '@/lib/templates';

import { format } from 'date-fns';

export async function GET() {
    try {
        await connectDB();

        const now = new Date();
        const oneMonthAhead = new Date();
        oneMonthAhead.setMonth(now.getMonth() + 1);

        const users = await User.find({
            paymentType: 'installment',
            endDate: { $gte: now, $lte: oneMonthAhead },
        });

        const adminEmail = process.env.ADMIN_EMAIL!;

        for (const user of users) {
            const formattedEndDate = format(new Date(user.endDate), 'MMMM d, yyyy');

            await sendMail({
                to: user.email,
                subject: 'Installment Payment Reminder',
                html: installmentReminderTemplate(user.fullName, user.program, formattedEndDate),
            });

            await sendMail({
                to: adminEmail,
                subject: 'Student Balance Due Soon',
                html: installmentReminderAdmin(user.fullName, user.program, formattedEndDate),
            });
        }

        return NextResponse.json({ message: `${users.length} reminder(s) sent.` });
    } catch (err) {
        console.error('[REMINDER_EMAIL_ERROR]', err);
        return NextResponse.json({ error: 'Failed to send reminders' }, { status: 500 });
    }
}
