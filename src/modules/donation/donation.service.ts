import { donationModel } from "./donation.models";
import { paymentService } from "../payment/payment.service";
import {
  CreateDonationPayload,
  DonationType,
  IDonation,
} from "./donation.interface";
import {
  IPayment,
  PaymentCurrency,
  PaymentProvider,
} from "../payment/payment.interface";
import CustomError from "../../helpers/CustomError";
import { Types } from "mongoose";
import { any } from "zod";

// Stripe এর webhook থেকে call হবে
const createDonationFromPayment = async (
  payment: IPayment,
): Promise<IDonation> => {
  const existing = await donationModel.findOne({ payment: payment._id });
  if (existing) return existing;

  const donationData: any = {
    payment: payment._id,
    amount: payment.amount,
    method: payment.provider, // stripe or paypal
    status: payment.status === "completed" ? "completed" : "pending",
    type: payment.metadata?.donationType ?? DonationType.ONE_TIME,
    donorEmail: payment.payerEmail,
    donorName: payment.payerName,
    isCompanyDonation: payment.metadata?.isCompanyDonation ?? false,
  };

  if (payment.metadata?.companyInfo) {
    donationData.companyInfo = payment.metadata.companyInfo;
  }

  const donation = await donationModel.create(donationData);

  return donation;
};

// Stripe donation শুরু করা
const initiateStripeDonation = async (
  payload: CreateDonationPayload,
): Promise<{ clientSecret: string; paymentIntentId: string }> => {
  const {
    amount,
    donorEmail,
    donorName,
    type,
    isCompanyDonation,
    companyInfo,
  } = payload;

  const result = await paymentService.createStripePaymentIntent({
    amount,
    currency: payload.payerEmail ? PaymentCurrency.EUR : PaymentCurrency.EUR,
    payerEmail: donorEmail,
    payerName: donorName,
    // donation metadata Stripe-এ পাঠাচ্ছি
    // webhook-এ এটা ফিরে আসবে
  } as any);

  // Stripe metadata update করো donation info দিয়ে
  const { stripe } = await import("../../lib/stripe");
  await stripe.paymentIntents.update(result.paymentIntentId, {
    metadata: {
      payerEmail: donorEmail,
      payerName: donorName,
      donationType: type,
      isCompanyDonation: String(isCompanyDonation ?? false),
      companyInfo: companyInfo ? JSON.stringify(companyInfo) : "",
    },
  });

  return result;
};

// PayPal donation শুরু করা
const initiatePayPalDonation = async (
  payload: CreateDonationPayload,
): Promise<{ orderId: string }> => {
  const { amount, donorEmail, donorName } = payload;

  const result = await paymentService.createPayPalOrder({
    amount,
    currency: PaymentCurrency.EUR,
    payerEmail: donorEmail,
    payerName: donorName,
  });

  return result;
};

// PayPal capture — এখানেই donation record তৈরি হবে
const capturePayPalDonation = async (
  payload: CreateDonationPayload & { orderId: string },
): Promise<IDonation> => {
  const {
    orderId,
    donorEmail,
    donorName,
    type,
    isCompanyDonation,
    companyInfo,
  } = payload;

  const payment = await paymentService.capturePayPalOrder({
    orderId,
    payerEmail: donorEmail,
    payerName: donorName,
  });

  const donationData: any = {
    payment: payment._id,
    amount: payment.amount,
    method: "paypal",
    status: payment.status === "completed" ? "completed" : "pending",
    type: type ?? DonationType.ONE_TIME,
    donorEmail,
    donorName,
    isCompanyDonation: isCompanyDonation ?? false,
  };

  if (companyInfo) {
    donationData.companyInfo = companyInfo;
  }

  const donation = await donationModel.create(donationData);

  return donation;
};

const syncPhysicalDonation = async (payload: {
  amount: number;
  donorEmail: string;
  donorName: string;
  status: "pending" | "completed" | "cancelled";
  referenceId: string; // ID of the DonationProof
}) => {
  const existing = await donationModel.findOne({ referenceId: payload.referenceId });
  if (existing) {
    existing.status = payload.status;
    await existing.save();
    return existing;
  }

  return await donationModel.create({
    amount: payload.amount,
    method: "collection_point",
    status: payload.status,
    donorEmail: payload.donorEmail,
    donorName: payload.donorName,
    type: DonationType.ONE_TIME,
    referenceId: payload.referenceId,
  });
};

const getAllDonations = async (req: any) => {
  const {
    page: pagebody,
    limit: limitbody,
    status,
    method,
    search,
    from,
    to,
    sort,
    sortBy,
  } = req.query;

  const { page, limit, skip } = (await import("../../utils/pagination")).paginationHelper(
    pagebody as string,
    limitbody as string,
  );

  const filter: any = {};

  if (search) {
    const searchRegex = new RegExp(search as string, "i");
    filter.$or = [
      { donorName: searchRegex },
      { donorEmail: searchRegex },
    ];
  }

  if (method) {
    filter.method = method;
  }

  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from as string);
    if (to) {
      const toDate = new Date(to as string);
      toDate.setHours(23, 59, 59, 999);
      filter.createdAt.$lte = toDate;
    }
  }

  
  // get payment populate pipeline
  const pipeline: any[] = [
    {
      $lookup: {
        from: "payments",
        localField: "payment",
        foreignField: "_id",
        as: "payment"
      }
    },
    { $unwind: { path: "$payment", preserveNullAndEmptyArrays: true } },
    {
      $addFields: {
        method: { $ifNull: ["$method", "$payment.provider"] }
      }
    }
  ];

  if (status) {
    filter.status = status;
  }

  pipeline.push({ $match: filter });

  const sortFields: Record<string, string> = {
    date: "createdAt",
    amount: "amount",
    donor: "donorName",
  };
  const sortByValue = typeof sortBy === "string" ? sortBy : "date";
  const sortField = sortFields[sortByValue.toLowerCase()] ?? "createdAt";
  const sortOrder = sort === "ascending" ? 1 : -1;

  pipeline.push({ $sort: { [sortField]: sortOrder } });

  const [result] = await donationModel.aggregate([
    {
      $facet: {
        donations: [
          ...pipeline,
          { $skip: skip },
          { $limit: limit }
        ],
        totalCount: [
          ...pipeline,
          { $count: "count" }
        ]
      }
    }
  ]);

  const donations = result.donations;
  const total = result.totalCount[0]?.count || 0;

  return {
    donations,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


const getSingleDonation = async (id: string) => {
  const donation = await donationModel.findById(id).populate("payment");
  if (!donation) {
    throw new CustomError(404, "Donation not found");
  }
  return donation;
};

export const donationService = {
  createDonationFromPayment,
  initiateStripeDonation,
  initiatePayPalDonation,
  capturePayPalDonation,
  getAllDonations,
  getSingleDonation,
  syncPhysicalDonation,
  getDonationStats: async () => {
    const [stats] = await donationModel.aggregate([
      {
        $facet: {
          completedStats: [
            { $match: { status: "completed" } },
            {
              $group: {
                _id: null,
                totalCollected: { $sum: "$amount" },
                totalTransactions: { $sum: 1 },
                avgBasket: { $avg: "$amount" },
              },
            },
          ],
          pendingStats: [
            { $match: { status: "pending" } },
            {
              $group: {
                _id: null,
                totalPending: { $sum: "$amount" },
              },
            },
          ],
        },
      },
    ]);

    const completed = stats.completedStats[0] || {
      totalCollected: 0,
      totalTransactions: 0,
      avgBasket: 0,
    };
    const pending = stats.pendingStats[0] || { totalPending: 0 };

    return {
      totalTransactions: completed.totalTransactions,
      totalCollected: completed.totalCollected,
      returnedToAssos: completed.totalCollected * 0.9, // Demo logic: 90% goes to association
      pendingAmount: pending.totalPending,
      averageBasket: completed.avgBasket || 0,
    };
  },
};

