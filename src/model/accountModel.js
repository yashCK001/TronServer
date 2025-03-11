import mongoose from "mongoose";

const SubAccountSchema = new mongoose.Schema(
  {
    mainAccountWalletAddress: {
      type: String,
      required: [true, "Main account wallet address is required"],
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      unique: true,
    },
    privateKey: {
      type: String,
      required: [true, "private is key is required"],
    },
    userName: {
      type: String,
      default: "Sub Account",
    },
    UID: {
      type: Number,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("subAccounts", SubAccountSchema);