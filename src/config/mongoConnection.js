import mongoose from "mongoose";

const mongoURI =
  process.env.MONGO_CONNECTION_STRING || "mongodb://localhost:27017/test-db-tron";

export const mongoDbConnection = async () => {
  try {
    await mongoose.connect(mongoURI);
    console.log("MonogoDb connection successfull 🚀✅");
  } catch (error) {
    console.error("Error occurred", error.message);
  }
};
