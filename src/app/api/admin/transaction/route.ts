import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import Transaction from '@/models/Transaction';
import User from '@/models/User';

export const runtime = 'nodejs';

const QuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    all: z.enum(['0', '1']).default('0'),
    status: z.enum(['success', 'pending']).optional(),
    type: z.enum(['initial', 'balance']).optional(),
    search: z.string().trim().optional(),
    month: z.string().regex(/^(?:all|[1-9]|1[0-2])$/).optional(),
    sortKey: z.enum(['date', 'amount']).default('date'),
    sortDir: z.enum(['asc', 'desc']).default('desc'),
});

type TxStatus = 'success' | 'pending';
type TxType = 'initial' | 'balance';

type TxDoc = {
    _id: unknown;
    amount: number;
    type: TxType;
    reference: string;
    status: TxStatus;
    createdAt: Date;
    userId?: { _id?: unknown; fullName?: string; email?: string; phone?: string } | null;
};

type AggByStatus = { _id: TxStatus; totalAmount: number; count: number };

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const qp = Object.fromEntries(req.nextUrl.searchParams);
        const parsed = QuerySchema.safeParse(qp);
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
        }

        const { page, all, status, type, search, month, sortKey, sortDir } = parsed.data;
        const limit = 20;

        const query: Record<string, any> = {};
        if (status) query.status = status;
        if (type) query.type = type;

        if (month && month !== 'all') {
            const m = Number(month);
            query.$expr = { $eq: [{ $month: '$createdAt' }, m] };
        }

        if (search && search.trim()) {
            const re = new RegExp(search.replace(/\s+/g, '.*'), 'i');
            const matchingUsers = await User.find({
                $or: [{ fullName: { $regex: re } }, { email: { $regex: re } }],
            })
                .select('_id')
                .lean()
                .exec();
            const userIds = matchingUsers.map((u) => u._id);
            query.$or = [{ userId: { $in: userIds } }, { reference: { $regex: re } }];
        }

        const sort: Record<string, 1 | -1> =
            sortKey === 'amount' ? { amount: sortDir === 'asc' ? 1 : -1 } : { createdAt: sortDir === 'asc' ? 1 : -1 };

        const baseFind = Transaction.find(query).sort(sort).populate('userId', 'fullName email phone');

        const docs =
            all === '1'
                ? await baseFind.lean()
                : await baseFind.skip((page - 1) * limit).limit(limit).lean();

        const transactions = (docs as TxDoc[]).map((t) => ({
            _id: String(t._id),
            userId: String((t.userId as any)?._id ?? t.userId),
            amount: t.amount,
            type: t.type,
            reference: t.reference,
            status: t.status,
            createdAt: t.createdAt,
            user: {
                fullName: (t.userId as any)?.fullName ?? '',
                email: (t.userId as any)?.email ?? '',
                phone: (t.userId as any)?.phone ?? '',
            },
        }));

        const [total, sumAgg] = await Promise.all([
            Transaction.countDocuments(query),
            Transaction.aggregate<AggByStatus>([
                { $match: query },
                { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
            ]),
        ]);

        const byStatus: Partial<Record<TxStatus, AggByStatus>> = Object.fromEntries(sumAgg.map((x) => [x._id, x]));

        const pendingInitialQuery: Record<string, any> = { status: 'pending', type: 'initial' };
        if (month && month !== 'all') {
            const m = Number(month);
            pendingInitialQuery.$expr = { $eq: [{ $month: '$createdAt' }, m] };
        }
        if (search && search.trim()) {
            const re = new RegExp(search.replace(/\s+/g, '.*'), 'i');
            const matchingUsers = await User.find({
                $or: [{ fullName: { $regex: re } }, { email: { $regex: re } }],
            })
                .select('_id')
                .lean()
                .exec();
            const userIds = matchingUsers.map((u) => u._id);
            pendingInitialQuery.$or = [{ userId: { $in: userIds } }, { reference: { $regex: re } }];
        }
        const pendingInitial = await Transaction.countDocuments(pendingInitialQuery);

        const summary = {
            sumSuccess: byStatus.success?.totalAmount ?? 0,
            pending: pendingInitial,
            failed: 0,
        };

        return NextResponse.json({
            transactions,
            total,
            page,
            pageSize: limit,
            summary,
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
