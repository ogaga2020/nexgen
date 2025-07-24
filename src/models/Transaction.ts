import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ITransaction extends Document {
    userId: Types.ObjectId;
    amount: number;
    type: 'initial' | 'balance';
    paymentMethod: 'Paystack';
    reference: string;
    status: 'success' | 'failed' | 'pending';
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User', required: true
    },
    amount: {
        type: Number,
        required: true
    },
    type: {
        type: String,
        enum: ['initial', 'balance'],
        required: true
    },
    paymentMethod: {
        type: String,
        enum: ['Paystack'],
        default: 'Paystack'
    },
    reference: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['success', 'failed', 'pending'],
        required: true
    },
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Transaction || mongoose.model<ITransaction>('Transaction', TransactionSchema);
