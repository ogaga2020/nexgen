import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import logger from '@/lib/logger';

export const runtime = 'nodejs';

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    await connectDB();
    const id = params.id;

    let body: any;
    try {
        body = await req.json();
    } catch {
        return new NextResponse('Invalid JSON body', { status: 400 });
    }

    try {
        const user = await User.findById(id);
        if (!user) return new NextResponse('Not found', { status: 404 });

        const updates: any = {};

        if (typeof body.fullName === 'string') updates.fullName = body.fullName;
        if (typeof body.email === 'string') updates.email = body.email;
        if (typeof body.phone === 'string') updates.phone = body.phone;
        if (typeof body.photo === 'string') updates.photo = body.photo;
        if (typeof body.trainingType === 'string') updates.trainingType = body.trainingType;
        if (typeof body.trainingDuration === 'number') updates.trainingDuration = body.trainingDuration;
        if (body.guarantor && typeof body.guarantor === 'object') {
            updates.guarantor = {
                fullName: body.guarantor.fullName ?? user.guarantor.fullName,
                email: body.guarantor.email ?? user.guarantor.email,
                phone: body.guarantor.phone ?? user.guarantor.phone,
                photo: body.guarantor.photo ?? user.guarantor.photo,
            };
        }

        if (typeof body.verificationStatus === 'string') {
            updates.verificationStatus = body.verificationStatus === 'verified' ? 'verified' : 'unverified';
            if (updates.verificationStatus === 'verified' && user.paymentStatus === 'not_paid') {
                updates.paymentStatus = 'partially_paid';
            }
        }

        if (body.markFullyPaid === true || body.paymentStatus === 'fully_paid') {
            updates.paymentStatus = 'fully_paid';
        }

        if (Object.keys(updates).length === 0) {
            return NextResponse.json({ ok: true, user });
        }

        const updated = await User.findByIdAndUpdate(id, updates, { new: true });
        logger.info({ route: '/api/admin/users/[id]', phase: 'patched', id, updates });
        return NextResponse.json({ ok: true, user: updated });
    } catch (e: any) {
        logger.error({ route: '/api/admin/users/[id]', phase: 'error', id, message: e?.message, stack: e?.stack });
        return new NextResponse('Server error', { status: 500 });
    }
}
