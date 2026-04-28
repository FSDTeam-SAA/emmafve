import { faqModel } from "./faq.models";
import { IFaq } from "./faq.interface";
import CustomError from "../../helpers/CustomError";

export const faqService = {
  async createFaq(data: IFaq) {
    return faqModel.create(data);
  },

  async getAllFaqs(query: any) {
    const filter: any = {};
    if (query.language) filter.language = query.language;
    if (query.category && query.category !== "ALL") filter.category = query.category;
    
    if (query.search) {
      filter.$or = [
        { question: { $regex: query.search, $options: "i" } },
        { answer: { $regex: query.search, $options: "i" } },
      ];
    }

    const page = parseInt(query.page as string) || 1;
    const limit = parseInt(query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const sortBy = query.sortBy || "category";
    const sortOrder = query.sortOrder === "desc" ? -1 : 1;

    const [data, total] = await Promise.all([
      faqModel.find(filter).sort({ [sortBy]: sortOrder, order: 1 }).skip(skip).limit(limit),
      faqModel.countDocuments(filter),
    ]);

    return { data, total, page, limit };
  },

  async getFaqById(id: string) {
    const faq = await faqModel.findById(id);
    if (!faq) throw new CustomError(404, "FAQ not found");
    return faq;
  },

  async updateFaq(id: string, data: Partial<IFaq>) {
    const faq = await faqModel.findByIdAndUpdate(id, data, { returnDocument: "after" });
    if (!faq) throw new CustomError(404, "FAQ not found");
    return faq;
  },

  async deleteFaq(id: string) {
    const result = await faqModel.findByIdAndDelete(id);
    if (!result) throw new CustomError(404, "FAQ not found");
    return true;
  },

  async reorderFaqs(orders: { id: string; order: number }[]) {
    const bulkOps = orders.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));
    return faqModel.bulkWrite(bulkOps);
  }
};
