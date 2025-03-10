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
    balance: {
      type: Number,
      default: 0,
    },
    userName: {
      type: String,
      default: 0,
    },
    UID: {
      type: Number,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("subAccounts", SubAccountSchema);