import { createFirestoreModel } from '@/lib/firestore-model';

export interface IAdmin {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  role: 'superadmin' | 'editor';
  lastLoggedIn?: Date;
  otp?: { code: string; expires: Date };
  resetToken?: { token: string; expires: Date };
  createdAt?: Date;
  updatedAt?: Date;
}

export default createFirestoreModel<IAdmin>('admins', { timestamps: true, unique: ['email'] });
