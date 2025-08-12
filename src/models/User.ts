import mongoose, { Schema, Document, Types, Model } from 'mongoose';

export interface IUser extends Document {
    fullName: string;
    email: string;
    phone: string;
    photo: string;
    trainingType: 'Electrical' | 'Plumbing' | 'Solar';
    trainingDuration: 4 | 8 | 12;
    guarantor: {
        fullName: string;
        email: string;
        phone: string;
        photo: string;
    };
    paymentStatus: 'not_paid' | 'partially_paid' | 'fully_paid';
    dueDate: Date;
    transactions: Types.ObjectId[];
    createdAt: Date;
}

const UserSchema = new Schema<IUser>({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true },
    photo: { type: String, required: true },
    trainingType: { type: String, enum: ['Electrical', 'Plumbing', 'Solar'], required: true },
    trainingDuration: { type: Number, enum: [4, 8, 12], required: true },
    guarantor: {
        fullName: { type: String, required: true },
        email: { type: String, required: true },
        phone: { type: String, required: true },
        photo: { type: String, required: true }
    },
    paymentStatus: { type: String, enum: ['not_paid', 'partially_paid', 'fully_paid'], default: 'not_paid' },
    dueDate: { type: Date, required: true },
    transactions: [{ type: Schema.Types.ObjectId, ref: 'Transaction' }],
    createdAt: { type: Date, default: Date.now }
});

const User: Model<IUser> =
    (mongoose.models.User as Model<IUser>) ||
    mongoose.model<IUser>('User', UserSchema);

export default User;
