import { Schema, model } from "mongoose";
import { IFaq } from "./faq.interface";

const faqSchema = new Schema<IFaq>(
  {
    question: { type: String, required: true },
    answer: { type: String, required: true },
    category: { type: String, required: true },
    language: { type: String, enum: ['en', 'fr'], default: 'fr' },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const faqModel = model<IFaq>("Faq", faqSchema);
