import mongoose, { Schema, Document } from 'mongoose';

export interface IAdmin extends Document {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'superadmin' | 'editor';
    lastLoggedIn?: Date;
}

const AdminSchema = new Schema<IAdmin>(
    {
        fullName: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        },
        phone: {
            type: String,
            required: true
        },
        password: {
            type: String,
            required: true
        },
        role: {
            type: String,
            enum: ['superadmin', 'editor'],
            default: 'editor'
        },
        lastLoggedIn: { type: Date },
    },
    { timestamps: true }
);

export default mongoose.models.Admin || mongoose.model<IAdmin>('Admin', AdminSchema);
