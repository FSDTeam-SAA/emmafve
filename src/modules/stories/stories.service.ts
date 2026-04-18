import { StoriesModel } from "./stories.models";
import { ICreateStories } from "./stories.interface";
import CustomError from "../../helpers/CustomError";
import { uploadCloudinary } from "../../helpers/cloudinary";

//TODO: customize as needed

const createStories = async (data: ICreateStories, image?: Express.Multer.File) => {
  const item = await StoriesModel.create(data);
  if (!item) throw new CustomError(400, "Stories not created");

  if (image) {
    const uploaded = await uploadCloudinary(image.path);
    if (uploaded) {
      item.image = uploaded;
      await item.save();
    }
  }

  return item;
};

export const storiesService = { createStories };
