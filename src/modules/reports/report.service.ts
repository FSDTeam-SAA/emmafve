import { Request } from "express";
import { reportModel } from "./report.models";
import CustomError from "../../helpers/CustomError";
import { uploadCloudinary, deleteCloudinary } from "../../helpers/cloudinary";
import { CreateReportPayload, UpdateReportPayload } from "./report.interface";
import { commentService } from "../comments/comment.service";

export const reportService = {
  // Create a new report
  async createReport(req: Request) {
    const authorId = req.user?._id;
    const body = req.body;
    let locationData = undefined;

    // Parse location if it comes stringified
    if (body.location && typeof body.location === 'string') {
      try {
        locationData = JSON.parse(body.location);
      } catch (e) {
        throw new CustomError(400, "Invalid JSON format in location field.");
      }
    } else if (body.location) {
      locationData = body.location;
    }

    // Process images
    const multerFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    const files = multerFiles?.["images"] || [];
    let images: { public_id: string; secure_url: string }[] = [];

    if (files && files.length > 0) {
      if (files.length > 3) {
        throw new CustomError(400, "Maximum of 3 images allowed");
      }
      for (const file of files) {
        const result = await uploadCloudinary(file.path);
        if (result) {
          images.push(result);
        }
      }
    }

    const payload: any = {
      ...body,
      location: locationData,
      images,
      author: authorId,
    };

    // Auto-generate title if missing
    if (!payload.title && payload.animalName) {
      const statusLabel = payload.status.charAt(0).toUpperCase() + payload.status.slice(1);
      payload.title = `${statusLabel} ${payload.species} - ${payload.animalName}`;
    }

    if (payload.isPhoneVisible === 'true') payload.isPhoneVisible = true;
    if (payload.isPhoneVisible === 'false') payload.isPhoneVisible = false;
    if (payload.isEmailVisible === 'true') payload.isEmailVisible = true;
    if (payload.isEmailVisible === 'false') payload.isEmailVisible = false;

    const newReport = await reportModel.create(payload);
    return newReport;
  },

  // Get all reports (with optional advanced filtering)
  async getAllReports(req: Request) {
    const {
      page = 1,
      limit = 10,
      search,
      status = "all", // lost, found, rescued, sighted, all
      from, // date range start
      to, // date range end
      species,
      sort = "ascending", // default ascending
    } = req.query;

    const skip = (Number(page) - 1) * Number(limit);
    const perPage = Number(limit);

    // Build filter object
    const filter: any = {};

    // Search (title/breed/description)
    if (search) {
      const searchRegex = new RegExp(search as string, "i");
      filter.$or = [
        { animalName: searchRegex },
        { title: searchRegex },
        { breed: searchRegex },
        { description: searchRegex },
      ];
    }

    // Status filter
    if (status && status !== "all") {
      const validStatuses = ["lost", "found", "rescued", "sighted"];
      if (!validStatuses.includes(status as string)) {
        throw new CustomError(
          400,
          `Invalid status. Must be one of: ${validStatuses.join(", ")}, or 'all'`
        );
      }
      filter.status = status;
    }

    // Category (Species) filter
    if (species) {
      filter.species = species;
    }

    // Date range filter
    if (from || to) {
      const isValidDate = (date: any) => {
        const d = new Date(date);
        return !isNaN(d.getTime());
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

    // Sort validation
    if (sort && sort !== "ascending" && sort !== "descending") {
      throw new CustomError(400, "Invalid sort value. Must be 'ascending' or 'descending'");
    }

    const sortOrder = sort === "descending" ? -1 : 1;

    // Query with pagination and performance optimization
    const [reports, total] = await Promise.all([
      reportModel.find(filter)
        .skip(skip)
        .limit(perPage)
        .sort({ createdAt: sortOrder })
        .populate("author", "firstName lastName email profileImage")
        .populate({
          path: "comments",
          select: "-__v -report",
          populate: [
            { path: "author", select: "firstName lastName profileImage" },
            { path: "replies", select: "-__v", populate: { path: "author", select: "firstName lastName profileImage" } },
            { path: "likes", select: "firstName lastName profileImage" }

          ]
        })
        .lean(),
      reportModel.countDocuments(filter),
    ]);

    return {
      reports,
      meta: {
        total,
        page: Number(page),
        limit: perPage,
        totalPages: Math.ceil(total / perPage),
      },
    };
  },

  // Get a single report by ID
  async getReportById(reportId: string) {
    const report = await reportModel
      .findById(reportId)
      .populate("author", "firstName lastName email profileImage")
      .populate({
        path: "comments",
        select: "-__v -report",
        populate: [
          { path: "author", select: "firstName lastName profileImage" },
          { path: "replies", select: "-__v", populate: { path: "author", select: "firstName lastName profileImage" } },
          { path: "likes", select: "firstName lastName profileImage" }

        ]
      })

    if (!report) {
      throw new CustomError(404, "Report not found");
    }

    return report;
  },

  // Update a report
  async updateReport(req: Request) {
    const authorId = req.user?._id;
    const { reportId } = req.params;
    const body = req.body;

    const report = await reportModel.findById(reportId);

    if (!report) {
      throw new CustomError(404, "Report not found");
    }

    // Verify ownership
    if (report.author.toString() !== authorId?.toString()) {
      throw new CustomError(403, "You are not authorized to update this report");
    }

    let locationData = report.location;
    // Parse location if it comes stringified
    if (body.location && typeof body.location === 'string') {
      try {
        locationData = JSON.parse(body.location);
      } catch (e) {
        throw new CustomError(400, "Invalid JSON format in location field.");
      }
    } else if (body.location) {
      locationData = body.location;
    }

    const multerFiles = req.files as { [fieldname: string]: Express.Multer.File[] };
    const files = multerFiles?.["images"] || [];
    let images = report.images;

    if (files && files.length > 0) {
      if (files.length > 3) {
        throw new CustomError(400, "Maximum of 3 images allowed");
      }

      // Delete old images
      if (images && images.length > 0) {
        for (const img of images) {
          if (img.public_id) {
            await deleteCloudinary(img.public_id);
          }
        }
      }

      images = [];
      for (const file of files) {
        const result = await uploadCloudinary(file.path);
        if (result) {
          images.push(result);
        }
      }
    }

    const payload: any = {
      ...body,
      location: locationData,
      images,
    };

    // Auto-generate title if missing or animalName changed and title is empty
    if (!payload.title && (payload.animalName || report.animalName)) {
      const animalName = payload.animalName || report.animalName;
      const species = payload.species || report.species;
      const status = payload.status || report.status;
      const statusLabel = status.charAt(0).toUpperCase() + status.slice(1);
      payload.title = `${statusLabel} ${species} - ${animalName}`;
    }

    if (payload.isPhoneVisible === 'true') payload.isPhoneVisible = true;
    if (payload.isPhoneVisible === 'false') payload.isPhoneVisible = false;
    if (payload.isEmailVisible === 'true') payload.isEmailVisible = true;
    if (payload.isEmailVisible === 'false') payload.isEmailVisible = false;

    const updatedReport = await reportModel.findByIdAndUpdate(
      reportId,
      payload,
      { returnDocument: 'after', runValidators: true }
    );

    return updatedReport;
  },

  // Delete a report
  async deleteReport(authorId: string, reportId: string) {
    const report = await reportModel.findById(reportId);

    if (!report) {
      throw new CustomError(404, "Report not found");
    }

    // Verify ownership
    if (report.author.toString() !== authorId) {
      throw new CustomError(403, "You are not authorized to delete this report");
    }

    await reportModel.findByIdAndDelete(reportId);

    // Delete associated comments
    await commentService.deleteAllCommentsByReport(reportId);

    if (report.images && report.images.length > 0) {
      for (const img of report.images) {
        if (img.public_id) {
          await deleteCloudinary(img.public_id);
        }
      }
    }
    return true;
  },

  // Add an image to a report
  async addImage(req: Request) {
    const authorId = req.user?._id;
    const { reportId } = req.params;
    const image = req.file;

    if (!image) {
      throw new CustomError(400, "Please upload an image");
    }

    const report = await reportModel.findById(reportId);
    if (!report) {
      throw new CustomError(404, "Report not found");
    }

    // Verify ownership
    if (report.author.toString() !== authorId?.toString()) {
      throw new CustomError(403, "You are not authorized to modify this report");
    }

    // Check count limit
    if (report.images.length >= 3) {
      throw new CustomError(400, "Maximum of 3 images allowed");
    }

    const result = await uploadCloudinary(image.path);
    if (!result) {
      throw new CustomError(500, "Failed to upload image");
    }

    report.images.push(result);
    await report.save();

    return report;
  },

  // Remove an image from a report
  async removeImage(req: Request) {
    const authorId = req.user?._id;
    const { reportId } = req.params;
    const { public_id } = req.body;

    if (!public_id) {
      throw new CustomError(400, "Please provide public_id of the image to remove");
    }

    const report = await reportModel.findById(reportId);
    if (!report) {
      throw new CustomError(404, "Report not found");
    }

    // Verify ownership
    if (report.author.toString() !== authorId?.toString()) {
      throw new CustomError(403, "You are not authorized to modify this report");
    }

    // Check if image exists in report
    const imageExists = report.images.some(img => img.public_id === public_id);
    if (!imageExists) {
      throw new CustomError(404, "Image not found in this report");
    }

    // Delete from Cloudinary
    await deleteCloudinary(public_id);

    // Remove from array
    report.images = report.images.filter(img => img.public_id !== public_id);
    await report.save();

    return report;
  },
};
