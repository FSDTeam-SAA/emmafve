import mongoose from "mongoose";
import dotenv from "dotenv";
import { userModel } from "../src/modules/usersAuth/user.models";

dotenv.config();

async function test() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to DB");

  try {
    const lng = 5.4333;
    const lat = 43.5333;
    const radiusKm = 10;
    const filter = {
      status: "active",
      $or: [
        {
          location: {
            $geoWithin: {
              $centerSphere: [[lng, lat], radiusKm / 6378.1],
            },
          },
        },
        { "location.coordinates": { $exists: false } },
        { "location.coordinates": { $size: 0 } },
        { location: null },
      ]
    };
    
    console.log("Running Query:", JSON.stringify(filter, null, 2));
    const users = await userModel.find(filter).select("_id");
    console.log(`Found ${users.length} users!`, users);

    // ensure index building triggered
    await userModel.syncIndexes();
    console.log("Indexes synced.");
  } catch (error) {
    console.error("Query Error:", error);
  } finally {
    process.exit(0);
  }
}

test();
