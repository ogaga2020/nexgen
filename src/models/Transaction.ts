import mongoose, { Schema, Document, Types, Model } from "mongoose";

export interface ITransaction extends Document {
    _id: Types.ObjectId;
    userId: Types.ObjectId;
    amount: number;
    type: "initial" | "balance";
    reference: string;
    status: "success" | "pending";
    createdAt: Date;
}

const TransactionSchema = new Schema<ITransaction>({
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    amount: { type: Number, required: true },
    type: { type: String, enum: ["initial", "balance"], required: true },
    reference: { type: String, required: true, index: true }, // set unique: true if you want
    status: { type: String, enum: ["success", "pending"], required: true, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
});

TransactionSchema.index({ userId: 1, type: 1, status: 1, createdAt: -1 });

const Transaction: Model<ITransaction> =
    (mongoose.models.Transaction as Model<ITransaction>) ||
    mongoose.model<ITransaction>("Transaction", TransactionSchema);

export default Transaction;
