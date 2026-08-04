import { createFirestoreModel } from '@/lib/firestore-model';

export interface ITransaction {
  userId: string;
  amount: number;
  type: 'initial' | 'balance';
  reference: string;
  status: 'success' | 'pending';
  createdAt?: Date;
}

export default createFirestoreModel<ITransaction>('transactions', { timestamps: true });
