import { Request } from "express";
import { commentModel } from "./comment.models";
import CustomError from "../../helpers/CustomError";
import { uploadCloudinary, deleteCloudinary } from "../../helpers/cloudinary";
import { IComment } from "./comment.interface";
import { reportModel } from "../reports/report.models";

export const commentService = {
  // Create a new comment or reply
  async createComment(req: Request) {
    const authorId = req.user?._id;
    const { content, reportId, parentId } = req.body;
    const image = req.file;

    // Verify report exists
    const report = await reportModel.findById(reportId);
    if (!report) {
      throw new CustomError(404, "Report not found");
    }

    let imageData = undefined;
    if (image) {
      const result = await uploadCloudinary(image.path);
      if (result) {
        imageData = result;
      }
    }

    const commentData: any = {
      content,
      author: authorId,
      report: reportId,
      image: imageData,
    };

    if (parentId) {
      const parentComment = await commentModel.findById(parentId);
      if (!parentComment) {
        throw new CustomError(404, "Parent comment not found");
      }
      commentData.parent = parentId;
    }

    const newComment = await commentModel.create(commentData);

    // Push ID to report
    await reportModel.findByIdAndUpdate(reportId, {
      $push: { comments: newComment._id }
    });

    // Populate author before returning
    await newComment.populate("author", "firstName lastName profileImage");

    return newComment;
  },

  // Get all comments for a report (nested)
  async getCommentsByReport(reportId: string) {
    const comments = await commentModel.find({ report: reportId, parent: null, isDeleted: false })
      .populate("author", "firstName lastName profileImage")
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: { path: "author", select: "firstName lastName profileImage" }
      })
      .sort({ createdAt: -1 });

    return comments;
  },

  // Get single comment
  async getCommentById(commentId: string) {
    const comment = await commentModel.findById(commentId)
      .populate("author", "firstName lastName profileImage")
      .populate({
        path: "replies",
        match: { isDeleted: false },
        populate: { path: "author", select: "firstName lastName profileImage" }
      });

    if (!comment || comment.isDeleted) {
      throw new CustomError(404, "Comment not found");
    }

    return comment;
  },

  // Toggle like
  async toggleLike(commentId: string, userId: string) {
    const comment = await commentModel.findById(commentId);
    if (!comment || comment.isDeleted) {
      throw new CustomError(404, "Comment not found");
    }

    const isLiked = comment.likes.includes(userId);
    if (isLiked) {
      comment.likes = comment.likes.filter(id => id.toString() !== userId);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    return comment;
  },

  // Update comment
  async updateComment(req: Request) {
    const authorId = req.user?._id;
    const { commentId } = req.params;
    const { content } = req.body;
    const image = req.file;

    const comment = await commentModel.findById(commentId);
    if (!comment || comment.isDeleted) {
      throw new CustomError(404, "Comment not found");
    }

    if (comment.author.toString() !== authorId?.toString()) {
      throw new CustomError(403, "You are not authorized to update this comment");
    }

    if (content) {
      comment.content = content;
    }

    if (image) {
      // Delete previous image if exists
      if (comment.image?.public_id) {
        await deleteCloudinary(comment.image.public_id);
      }

      const result = await uploadCloudinary(image.path);
      if (result) {
        comment.image = result;
      }
    }

    await comment.save();
    return comment;
  },

  // Delete comment (soft delete)
  async deleteComment(commentId: string, userId: string) {
    const comment = await commentModel.findById(commentId);
    if (!comment || comment.isDeleted) {
      throw new CustomError(404, "Comment not found");
    }

    if (comment.author.toString() !== userId) {
      throw new CustomError(403, "You are not authorized to delete this comment");
    }

    await comment.deleteOne();
    //if have image delete from cloudinary
    if (comment.image?.public_id) {
      await deleteCloudinary(comment.image.public_id);
    }

    // remove comment from report
    await reportModel.findByIdAndUpdate(comment.report, {
      $pull: { comments: commentId }
    });


    return true;
  },

  // Delete all comments for a report (internal use)
  async deleteAllCommentsByReport(reportId: string) {
    const comments = await commentModel.find({ report: reportId });
    for (const comment of comments) {
      if (comment.image?.public_id) {
        await deleteCloudinary(comment.image.public_id);
      }
    }
    await commentModel.deleteMany({ report: reportId });
    return true;
  },
};
