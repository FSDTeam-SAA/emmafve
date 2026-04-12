import { Request } from "express";
import CustomError from "../../helpers/CustomError";
import { deleteCloudinary, uploadCloudinary } from "../../helpers/cloudinary";
import { paginationHelper } from "../../utils/pagination";
import { ContactStatus, CreateContactPayload, UpdateContactPayload } from "./contact.interface";
import { contactModel } from "./contact.models";

const deleteCloudinaryQuietly = async (publicId?: string): Promise<void> => {
  if (!publicId) return;

  try {
    await deleteCloudinary(publicId);
  } catch (error) {
    console.error(`[Cloudinary] Failed to delete ${publicId}:`, error);
  }
};

export const contactService = {
  async createContact(req: Request) {
    const data = req.body as CreateContactPayload;
    const image = req.file;
    let photo;

    if (image) {
      photo = await uploadCloudinary(image.path);
    }

    try {
      return await contactModel.create({
        ...data,
        ...(photo ? { photo } : {}),
      });
    } catch (error) {
      await deleteCloudinaryQuietly(photo?.public_id);
      throw error;
    }
  },

  async getAllContacts(req: Request) {
    const {
      page: pagebody,
      limit: limitbody,
      type,
      search,
      city,
      country,
      from,
      to,
      sort,
      sortBy,
      status = ContactStatus.ACTIVE,
    } = req.query;

    const { page, limit, skip } = paginationHelper(pagebody as string, limitbody as string);
    const filter: any = {};

    if (type) filter.type = type;
    if (city) filter.city = { $regex: city, $options: "i" };
    if (country) filter.country = { $regex: country, $options: "i" };
    if (status && status !== "all") filter.status = status;
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      filter.$or = [
        { name: searchRegex },
        { description: searchRegex },
        { address: searchRegex },
        { city: searchRegex },
        { country: searchRegex },
      ];
    }

    if (from || to) {
      const isValidDate = (date: any) => {
        const parsedDate = new Date(date);
        return !Number.isNaN(parsedDate.getTime());
      };

      if (from && !isValidDate(from)) {
        throw new CustomError(400, "Invalid 'from' date. Format must be YYYY-MM-DD or ISO");
      }

      if (to && !isValidDate(to)) {
        throw new CustomError(400, "Invalid 'to' date. Format must be YYYY-MM-DD or ISO");
      }

      if (from && to && new Date(from as string) > new Date(to as string)) {
        throw new CustomError(400, "'from' date cannot be greater than 'to' date");
      }

      filter.createdAt = {};

      if (from) {
        const fromDate = new Date(from as string);
        fromDate.setHours(0, 0, 0, 0);
        filter.createdAt.$gte = fromDate;
      }

      if (to) {
        const toDate = new Date(to as string);
        toDate.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = toDate;
      }
    }

    if (sort && sort !== "ascending" && sort !== "descending") {
      throw new CustomError(400, "Invalid sort value. Must be 'ascending' or 'descending'");
    }

    const sortFields: Record<string, string> = {
      name: "name",
      date: "createdAt",
      city: "city",
      country: "country",
    };
    const sortByValue = typeof sortBy === "string" ? sortBy : "name";
    const sortField = sortFields[sortByValue.toLowerCase()];
    if (!sortField) {
      throw new CustomError(400, `Invalid sortBy value. Must be one of: ${Object.keys(sortFields).join(", ")}`);
    }
    const sortOrder = sort === "descending" ? -1 : 1;

    const [contacts, total] = await Promise.all([
      contactModel.find(filter).sort({ [sortField]: sortOrder }).skip(skip).limit(limit).lean(),
      contactModel.countDocuments(filter),
    ]);

    return {
      contacts,
      meta: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  async getContactById(contactId: string) {
    const contact = await contactModel.findById(contactId);
    if (!contact) throw new CustomError(404, "Contact not found");
    return contact;
  },

  async updateContact(req: Request) {
    const { contactId } = req.params;
    const data = req.body as UpdateContactPayload;
    const image = req.file;

    const contact = await contactModel.findById(contactId);
    if (!contact) throw new CustomError(404, "Contact not found");

    const oldPublicIdToDelete = image ? contact.photo?.public_id : undefined;
    let newPublicIdToDeleteOnFailure: string | undefined;

    Object.assign(contact, data);

    if (image) {
      const uploaded = await uploadCloudinary(image.path);
      contact.photo = uploaded;
      newPublicIdToDeleteOnFailure = uploaded.public_id;
    }

    try {
      await contact.save();
    } catch (error) {
      await deleteCloudinaryQuietly(newPublicIdToDeleteOnFailure);
      throw error;
    }

    await deleteCloudinaryQuietly(oldPublicIdToDelete);
    return contact;
  },

  async deleteContact(contactId: string) {
    const contact = await contactModel.findById(contactId);
    if (!contact) throw new CustomError(404, "Contact not found");

    await contact.deleteOne();
    await deleteCloudinaryQuietly(contact.photo?.public_id);
    return true;
  },
};
