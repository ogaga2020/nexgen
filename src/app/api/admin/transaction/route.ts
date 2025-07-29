import { connectDB } from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = 20;
        const skip = (page - 1) * limit;
        const status = searchParams.get('status');
        const search = searchParams.get('search');

        const query: any = {};

        if (status && ['success', 'failed', 'pending'].includes(status)) {
            query.status = status;
        }

        if (search) {
            const matchingUsers = await User.find({
                fullName: { $regex: new RegExp(search.replace(/\s+/g, '.*'), 'i') },
            }).select('_id');

            query.userId = { $in: matchingUsers.map((u) => u._id) };
        }

        const total = await Transaction.countDocuments(query);

        const transactions = await Transaction.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('userId', 'fullName email phone')
            .lean();

        const formatted = transactions.map((t: any) => ({
            _id: t._id.toString(),
            amount: t.amount,
            type: t.type,
            paymentMethod: t.paymentMethod,
            reference: t.reference,
            status: t.status,
            createdAt: t.createdAt,
            user: {
                fullName: t.userId?.fullName,
                email: t.userId?.email,
                phone: t.userId?.phone,
            },
        }));

        return NextResponse.json({ transactions: formatted, total });
    } catch (err) {
        console.error('[TRANSACTIONS_GET_ERROR]', err);
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
