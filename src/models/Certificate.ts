import mongoose, { Schema, Document, Model } from "mongoose";

export interface ICertificate extends Document {
  fullName: string;
  email: string;
  course: string;
  months: string;
  issuedOn: string;
  createdAt: Date;
}

const CertificateSchema = new Schema<ICertificate>(
  {
    fullName: { type: String, required: true },
    email: { type: String, required: true, index: true },
    course: { type: String, required: true },
    months: { type: String, required: true },
    issuedOn: { type: String, required: true },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

const Certificate: Model<ICertificate> =
  (mongoose.models.Certificate as Model<ICertificate>) ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema);

export default Certificate;
