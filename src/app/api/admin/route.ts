import { connectDB } from '@/lib/db';
import Admin from '@/models/Admin';
import { NextResponse } from 'next/server';
import logger from '@/lib/logger';

export async function GET() {
    try {
        await connectDB();
        const count = await Admin.countDocuments();
        logger.info({ route: '/api/admin', method: 'GET', exists: count > 0 });
        return NextResponse.json({ exists: count > 0 });
    } catch (err: any) {
        logger.error({ route: '/api/admin', method: 'GET', message: err?.message, stack: err?.stack });
        return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}

export async function POST() {
    return NextResponse.json({ error: 'Use the protected admin setup endpoint' }, { status: 405 });
}
