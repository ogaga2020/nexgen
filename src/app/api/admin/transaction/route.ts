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

        const baseQuery: Record<string, any> = {};
        if (status) baseQuery.status = status;
        if (type) baseQuery.type = type;

        if (month && month !== 'all') {
            const m = Number(month);
            baseQuery.$expr = { $eq: [{ $month: '$createdAt' }, m] };
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
            baseQuery.$or = [{ userId: { $in: userIds } }, { reference: { $regex: re } }];
        }

        const sortTx: Record<string, 1 | -1> =
            sortKey === 'amount' ? { amount: sortDir === 'asc' ? 1 : -1 } : { createdAt: sortDir === 'asc' ? 1 : -1 };

        const txDocs: TxDoc[] = await Transaction.find(baseQuery)
            .sort(sortTx)
            .populate('userId', 'fullName email phone')
            .lean();

        const byUser = new Map<
            string,
            {
                _id: string;
                userId: string;
                user: { fullName: string; email: string; phone: string };
                amount: number;
                type: 'total';
                status: TxStatus;
                reference: string;
                createdAt: Date;
                hasPending: boolean;
                lastDate: Date;
                lastRef: string;
            }
        >();

        for (const t of txDocs) {
            const uid = String((t.userId as any)?._id ?? t.userId);
            const name = (t.userId as any)?.fullName ?? '';
            const email = (t.userId as any)?.email ?? '';
            const phone = (t.userId as any)?.phone ?? '';
            const createdAt = new Date(t.createdAt);
            const ref = t.reference;

            const existing = byUser.get(uid);
            if (!existing) {
                byUser.set(uid, {
                    _id: uid,
                    userId: uid,
                    user: { fullName: name, email, phone },
                    amount: t.amount,
                    type: 'total',
                    status: t.status,
                    reference: ref,
                    createdAt,
                    hasPending: t.status === 'pending',
                    lastDate: createdAt,
                    lastRef: ref,
                });
            } else {
                existing.amount += t.amount;
                if (createdAt > existing.lastDate) {
                    existing.lastDate = createdAt;
                    existing.lastRef = ref;
                }
                if (t.status === 'pending') existing.hasPending = true;
                existing.status = existing.hasPending ? 'pending' : 'success';
            }
        }

        const grouped = Array.from(byUser.values());

        grouped.sort((a, b) => {
            if (sortKey === 'amount') {
                return sortDir === 'asc' ? a.amount - b.amount : b.amount - a.amount;
            }
            return sortDir === 'asc'
                ? a.lastDate.getTime() - b.lastDate.getTime()
                : b.lastDate.getTime() - a.lastDate.getTime();
        });

        const totalGrouped = grouped.length;
        const paginated =
            all === '1' ? grouped : grouped.slice((page - 1) * limit, (page - 1) * limit + limit);

        const transactions = paginated.map((g) => ({
            _id: g._id,
            userId: g.userId,
            amount: g.amount,
            type: 'total' as const,
            reference: g.lastRef,
            status: g.hasPending ? ('pending' as const) : ('success' as const),
            createdAt: g.lastDate,
            user: g.user,
        }));

        const [sumAgg] = await Promise.all([
            Transaction.aggregate<AggByStatus>([
                { $match: baseQuery },
                { $group: { _id: '$status', totalAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
            ]),
        ]);

        const byStatus: Partial<Record<TxStatus, AggByStatus>> = Object.fromEntries(
            (sumAgg || []).map((x) => [x._id, x])
        );

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
            total: totalGrouped,
            page,
            pageSize: all === '1' ? totalGrouped : limit,
            summary,
        });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch transactions' }, { status: 500 });
    }
}
