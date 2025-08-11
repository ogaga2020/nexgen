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
        const all = searchParams.get('all') === '1';

        const status = searchParams.get('status');
        const type = searchParams.get('type');
        const search = searchParams.get('search') || '';
        const monthParam = searchParams.get('month');
        const sortKey = (searchParams.get('sortKey') as 'date' | 'amount') || 'date';
        const sortDir = (searchParams.get('sortDir') as 'asc' | 'desc') || 'desc';

        const query: any = {};

        if (status && ['success', 'failed', 'pending'].includes(status)) {
            query.status = status;
        }

        if (type && ['initial', 'balance'].includes(type)) {
            query.type = type;
        }

        if (monthParam && monthParam !== 'all') {
            const m = parseInt(monthParam);
            if (m >= 1 && m <= 12) {
                query.$expr = { $eq: [{ $month: '$createdAt' }, m] };
            }
        }

        if (search) {
            const re = new RegExp(search.replace(/\s+/g, '.*'), 'i');
            const matchingUsers = await User.find({
                $or: [{ fullName: { $regex: re } }, { email: { $regex: re } }],
            }).select('_id');
            const userIds = matchingUsers.map((u) => u._id);
            query.$or = [{ userId: { $in: userIds } }, { reference: { $regex: re } }];
        }

        const total = await Transaction.countDocuments(query);

        const sort: any =
            sortKey === 'amount'
                ? { amount: sortDir === 'asc' ? 1 : -1 }
                : { createdAt: sortDir === 'asc' ? 1 : -1 };

        const baseFind = Transaction.find(query).sort(sort).populate('userId', 'fullName email phone');

        const docs = all ? await baseFind.lean() : await baseFind.skip((page - 1) * limit).limit(limit).lean();

        const transactions = docs.map((t: any) => ({
            _id: String(t._id),
            amount: t.amount,
            type: t.type,
            paymentMethod: t.paymentMethod,
            reference: t.reference,
            status: t.status,
            createdAt: t.createdAt,
            user: {
                fullName: t.userId?.fullName || '',
                email: t.userId?.email || '',
                phone: t.userId?.phone || '',
            },
        }));

        const sumAgg = await Transaction.aggregate([
            { $match: query },
            {
                $group: {
                    _id: '$status',
                    totalAmount: { $sum: '$amount' },
                    count: { $sum: 1 },
                },
            },
        ]);

        const byStatus = Object.fromEntries(sumAgg.map((x: any) => [x._id, x]));
        const summary = {
            sumSuccess: byStatus.success?.totalAmount || 0,
            pending: byStatus.pending?.count || 0,
            failed: byStatus.failed?.count || 0,
        };

        return NextResponse.json({
            transactions,
            total,
            page,
            pageSize: limit,
            summary,
        });
    } catch (err) {
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
