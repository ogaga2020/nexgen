import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IAdmin extends Document {
    fullName: string;
    email: string;
    phone: string;
    password: string;
    role: 'superadmin' | 'editor';
    lastLoggedIn?: Date;
    otp?: {
        code: string;
        expires: Date;
    };
}

const AdminSchema = new Schema<IAdmin>(
    {
        fullName: { type: String, required: true },
        email: { type: String, required: true, unique: true, lowercase: true, trim: true },
        phone: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, enum: ['superadmin', 'editor'], default: 'editor' },
        lastLoggedIn: { type: Date },
        otp: {
            code: { type: String },
            expires: { type: Date }
        }
    },
    { timestamps: true }
);

const Admin: Model<IAdmin> =
    (mongoose.models.Admin as Model<IAdmin>) || mongoose.model<IAdmin>('Admin', AdminSchema);

export default Admin;
