import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IMedia extends Document {
  publicId: string;
  url: string;
  type: 'image' | 'video';
  category: 'electric' | 'solar' | 'plumbing';
  createdAt: Date;
  uploadedBy: Types.ObjectId;
  uploadedByName: string;
}

const MediaSchema = new Schema<IMedia>(
  {
    publicId: { type: String, required: true, unique: true },
    url: { type: String, required: true },
    type: { type: String, enum: ['image', 'video'], required: true },
    category: { type: String, enum: ['electric', 'solar', 'plumbing'], required: true },
    createdAt: { type: Date, required: true },
    uploadedBy: { type: Schema.Types.ObjectId, ref: 'Admin', required: true },
    uploadedByName: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.models.Media || mongoose.model<IMedia>('Media', MediaSchema);
