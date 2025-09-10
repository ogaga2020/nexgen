import mongoose, { Schema, Document, Model } from 'mongoose';

export type TrainingType = 'Electrical' | 'Plumbing' | 'Solar';
export type TrainingDuration = 4 | 8 | 12;
export type VerificationStatus = 'pending' | 'verified';

export interface IRegistration extends Document {
  fullName: string;
  email: string;
  phone: string;
  photo: string;
  trainingType: TrainingType;
  trainingDuration: TrainingDuration;
  // optional intake month label (e.g., "October 2025")
  intakeMonth?: string;

  guarantor: {
    fullName: string;
    email: string;
    phone: string;
    photo: string;
  };

  // admin flips this after confirming on WhatsApp
  verificationStatus: VerificationStatus;

  // pricing snapshot at submission
  tuition: number;
  firstPayment: number; // 60%
  balance: number;      // 40%

  createdAt: Date;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true, trim: true },
    phone: { type: String, required: true },
    photo: { type: String, required: true },

    trainingType: { type: String, enum: ['Electrical', 'Plumbing', 'Solar'], required: true },
    trainingDuration: { type: Number, enum: [4, 8, 12], required: true },
    intakeMonth: { type: String }, // optional

    guarantor: {
      fullName: { type: String, required: true },
      email: { type: String, required: true, lowercase: true, trim: true },
      phone: { type: String, required: true },
      photo: { type: String, required: true },
    },

    verificationStatus: { type: String, enum: ['pending', 'verified'], default: 'pending' },

    tuition: { type: Number, required: true },
    firstPayment: { type: Number, required: true },
    balance: { type: Number, required: true },

    createdAt: { type: Date, default: Date.now },
  },
  { versionKey: false }
);

// If you want to prevent duplicates for same person+cohort, uncomment:
// RegistrationSchema.index(
//   { email: 1, trainingType: 1, trainingDuration: 1, intakeMonth: 1 },
//   { unique: true, partialFilterExpression: { email: { $exists: true } } }
// );

const Registration: Model<IRegistration> =
  (mongoose.models.Registration as Model<IRegistration>) ||
  mongoose.model<IRegistration>('Registration', RegistrationSchema);

export default Registration;
