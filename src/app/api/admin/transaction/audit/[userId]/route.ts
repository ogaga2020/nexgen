import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import User from '@/models/User';
import Transaction from '@/models/Transaction';

export const runtime = 'nodejs';

type TrainingDuration = 4 | 8 | 12;
const TUITION_BY_DURATION: Record<TrainingDuration, number> = {
  4: 250_000,
  8: 450_000,
  12: 700_000
};

export async function GET(_req: Request, { params }: any) {
  try {
    await connectDB();

    const user = await User.findById(params.userId)
      .select('fullName email phone trainingType trainingDuration paymentStatus createdAt')
      .lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const txs = await Transaction.find({ userId: user._id })
      .sort({ createdAt: 1 })
      .select('_id amount type reference status createdAt')
      .lean();

    const initial = txs.find((t) => t.type === 'initial') || null;
    const balance = txs.find((t) => t.type === 'balance') || null;

    const tuition = TUITION_BY_DURATION[user.trainingDuration as TrainingDuration];
    const expectedInitial = Math.round(tuition * 0.6);
    const expectedBalance = tuition - expectedInitial;
    const paidTotal =
      (initial?.status === 'success' ? initial?.amount || 0 : 0) +
      (balance?.status === 'success' ? balance?.amount || 0 : 0);

    return NextResponse.json({
      user: {
        id: String(user._id),
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        trainingType: user.trainingType,
        trainingDuration: user.trainingDuration,
        paymentStatus: user.paymentStatus,
        tuition,
        expectedInitial,
        expectedBalance,
        paidTotal
      },
      initial: initial
        ? {
          id: String(initial._id),
          amount: initial.amount,
          expected: expectedInitial,
          status: initial.status,
          reference: initial.reference,
          date: initial.createdAt
        }
        : null,
      balance: balance
        ? {
          id: String(balance._id),
          amount: balance.amount,
          expected: expectedBalance,
          status: balance.status,
          reference: balance.reference,
          date: balance.createdAt
        }
        : null
    });
  } catch {
    return NextResponse.json({ error: 'Failed to load audit' }, { status: 500 });
  }
}
