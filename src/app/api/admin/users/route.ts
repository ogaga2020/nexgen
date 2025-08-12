import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

const QuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    filter: z
        .enum(['all', 'paid', 'fully_paid', 'partially_paid', 'unpaid'])
        .default('paid'),
    search: z.string().trim().optional(),
});

export async function GET(req: NextRequest) {
    try {
        await connectDB();

        const parsed = QuerySchema.safeParse(
            Object.fromEntries(req.nextUrl.searchParams)
        );
        if (!parsed.success) {
            return NextResponse.json({ error: 'Invalid query' }, { status: 400 });
        }

        const { page, filter, search } = parsed.data;
        const limit = 20;
        const skip = (page - 1) * limit;

        const query: Record<string, unknown> = {};

        if (filter === 'paid' || filter === 'all') {
            query.paymentStatus = { $in: ['partially_paid', 'fully_paid'] };
        } else if (filter === 'fully_paid' || filter === 'partially_paid') {
            query.paymentStatus = filter;
        } else if (filter === 'unpaid') {
            query.paymentStatus = 'not_paid';
        }

        if (search && search.length > 0) {
            const re = new RegExp(search.replace(/\s+/g, '.*'), 'i');
            query.$or = [
                { fullName: { $regex: re } },
                { email: { $regex: re } },
                { phone: { $regex: re } },
            ];
        }

        const [users, total] = await Promise.all([
            User.find(query)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('fullName email phone trainingType trainingDuration paymentStatus guarantor')
                .lean()
                .exec(),
            User.countDocuments(query),
        ]);

        return NextResponse.json({ users, total, page, limit });
    } catch {
        return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
    }
}
