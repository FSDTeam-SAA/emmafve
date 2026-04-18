import mongoose, { Schema } from "mongoose";
    import slugify from "slugify";
    import CustomError from "../../helpers/CustomError";
import { IStories } from "./stories.interface";

//TODO: customize as needed

const storiesSchema = new Schema<IStories>({
  title: { type: String, required: true },
  description: { type: String },
  status: { type: String, default: "active" },
  isDeleted: { type: Boolean, default: false },
  slug: { type: String },
}, { timestamps: true });

// Generate slug before save
storiesSchema.pre("save", async function (next) {
  if (!this.isModified("title")) return;

  const category = await StoriesModel.findOne({ title: this.title });
  if (category) {
    throw new CustomError(400, "Stories already exist");
  }

  this.slug = slugify(this.title, {
    lower: true,
    strict: true,
    trim: true,
  });
});

// Generate slug on update
storiesSchema.pre("findOneAndUpdate", async function () {
  const update = this.getUpdate() as any;

  const category = await StoriesModel.findOne({ title: update.title });
  if (category) {
    throw new CustomError(400, "Stories already exist");
  }

  if (update?.title) {
    update.slug = slugify(update.title, {
      lower: true,
      strict: true,
      trim: true,
    });
  }

});

export const StoriesModel = mongoose.model<IStories>("Stories", storiesSchema);
