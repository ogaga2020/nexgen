import mongoose from 'mongoose';
import logger from '@/lib/logger';

declare global {
    var __mongoose: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } | undefined;
}
const g = global as any;
if (!g.__mongoose) g.__mongoose = { conn: null, promise: null };

export async function connectDB() {
    if (g.__mongoose.conn) return g.__mongoose.conn;

    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not defined in .env.local');

    if (!g.__mongoose.promise) {
        g.__mongoose.promise = mongoose.connect(uri, {
            serverSelectionTimeoutMS: 8000,
            heartbeatFrequencyMS: 2500,
            maxPoolSize: 5,
        }).then((m) => {
            logger.info({ route: 'db', phase: 'connected' });
            return m;
        }).catch((err) => {
            logger.error({
                route: 'db',
                phase: 'connection_error',
                message: err?.message,
                name: err?.name,
                code: err?.code,
                reason: (err?.reason && err.reason.message) || undefined,
                stack: err?.stack,
            });
            throw err;
        });

        mongoose.connection.on('error', (e) => {
            logger.error({ route: 'db', phase: 'runtime_error', message: e?.message, stack: e?.stack });
        });
        mongoose.connection.on('disconnected', () => {
            logger.warn({ route: 'db', phase: 'disconnected' });
        });
    }

    g.__mongoose.conn = await g.__mongoose.promise;
    return g.__mongoose.conn;
}
