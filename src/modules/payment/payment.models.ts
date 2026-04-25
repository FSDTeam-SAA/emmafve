import mongoose, { Model, Schema } from "mongoose";
import {
  IPayment,
  PaymentCurrency,
  PaymentProvider,
  PaymentStatus,
} from "./payment.interface";

const paymentSchema = new Schema<IPayment>(
  {
    provider: {
      type: String,
      enum: Object.values(PaymentProvider),
      required: true,
    },
    providerTransactionId: {
      type: String,
      required: true,
      unique: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    currency: {
      type: String,
      enum: Object.values(PaymentCurrency),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    payerEmail: {
      type: String,
      required: true,
    },
    payerName: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  },
);

paymentSchema.index(
  { provider: 1, providerTransactionId: 1 },
  { unique: true },
);
paymentSchema.index({ payerEmail: 1 });
paymentSchema.index({ status: 1 });

export const paymentModel: Model<IPayment> = mongoose.model<IPayment>(
  "Payment",
  paymentSchema,
);
