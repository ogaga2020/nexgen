import mongoose, { Schema, Document } from 'mongoose';

export interface IRevenue extends Document {
    totalAmount: number;
    source: 'training' | 'other';
    description?: string;
    createdAt: Date;
}

const RevenueSchema = new Schema<IRevenue>({
    totalAmount: {
        type: Number,
        required: true
    },
    source: {
        type: String,
        enum: ['training', 'other'],
        default: 'training'
    },
    description: { type: String },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Revenue || mongoose.model<IRevenue>('Revenue', RevenueSchema);
