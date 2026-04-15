import mongoose from "mongoose";
import dotenv from "dotenv";
import { userModel } from "../src/modules/usersAuth/user.models";

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to DB");

  try {
    const user = await userModel.findById("69d835637594abb158b910e8");
    console.log("Found testing user:", user);
  } catch (error) {
    console.error("Query Error:", error);
  } finally {
    process.exit(0);
  }
}

test();
