import { createFirestoreModel } from '@/lib/firestore-model';

export interface IUser {
  fullName: string;
  email: string;
  phone: string;
  photo: string;
  trainingType: 'Electrical' | 'Plumbing' | 'Solar';
  trainingDuration: 4 | 8 | 12;
  guarantor: { fullName: string; email: string; phone: string; photo: string };
  paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid';
  verificationStatus: 'unverified' | 'verified';
  dueDate: Date;
  startDate?: Date;
  transactions: string[];
  createdAt?: Date;
}

export default createFirestoreModel<IUser>('users', { timestamps: true, unique: ['email'] });
