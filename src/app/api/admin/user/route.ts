import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        await connectDB();

        const users = await User.find()
            .select('fullName email phone trainingType trainingDuration paymentStatus')
            .sort({ createdAt: -1 });

        return NextResponse.json(users);
    } catch (err) {
        console.error('[ADMIN_USERS_GET_ERROR]', err);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
