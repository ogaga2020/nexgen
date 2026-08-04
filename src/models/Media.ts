import { createFirestoreModel } from '@/lib/firestore-model';

export interface IMedia {
  publicId: string;
  url: string;
  type: 'image' | 'video';
  category: 'electric' | 'solar' | 'plumbing';
  createdAt: Date;
  uploadedBy: string;
  uploadedByName: string;
}

export default createFirestoreModel<IMedia>('media', { timestamps: true, unique: ['publicId'] });
