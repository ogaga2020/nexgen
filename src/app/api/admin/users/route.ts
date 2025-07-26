import { connectDB } from '@/lib/db';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;

        const filter = searchParams.get('filter');
        const search = searchParams.get('search');

        const query: any = {};

        if (filter && ['not_paid', 'partially_paid', 'fully_paid'].includes(filter)) {
            query.paymentStatus = filter;
        }

        if (search) {
            query.fullName = {
                $regex: new RegExp(search.replace(/\s+/g, '.*'), 'i')
            };
        }

        const total = await User.countDocuments(query);
        const users = await User.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .select('fullName email phone trainingType trainingDuration paymentStatus guarantor');

        return NextResponse.json({ users, total });
    } catch (err) {
        console.error('[ADMIN_USERS_GET_ERROR]', err);
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
