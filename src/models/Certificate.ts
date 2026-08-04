import { createFirestoreModel } from '@/lib/firestore-model';

export interface ICertificate {
  fullName: string;
  email: string;
  course: string;
  months: string;
  issuedOn: string;
  createdAt?: Date;
}

export default createFirestoreModel<ICertificate>('certificates', {
  timestamps: { createdAt: true, updatedAt: false },
});
