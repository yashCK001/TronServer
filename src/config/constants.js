import {config} from "dotenv";
import { tronWebConfigMain } from "./tronConfig.js";
config();

const TRON_GRID_API = "https://nile.trongrid.io";
const TRON_MAINNET_API = "https://api.trongrid.io";

const MAIN_WALLET_PRIVATE_KEY = process.env.MAIN_WALLET_PRIVATE_KEY;
const MAIN_ACCOUNT_WALLET_ADDRESS = process.env.MAIN_ACCOUNT_WALLET_ADDRESS;

const getBalance = async (walletAddress) => {
      const balanceInSun = await tronWebConfigMain.trx.getBalance(walletAddress);
      const balanceInTRX = tronWebConfigMain.fromSun(balanceInSun);
      return balanceInTRX
}

const sendTron = async (receiver, amount) => {
  try {
    if (!tronWebConfigMain.isAddress(receiver)) {
      throw new Error("Invalid Tron address provided. Please check the address.");
    }

    console.log(`🔹 Sending ${amount} TRX to ${receiver} on Nile Testnet...`);

    const senderAddress = tronWebConfigMain.defaultAddress.base58;
    const senderBalance = await tronWebConfigMain.trx.getBalance(senderAddress);
    const amountInSun = tronWebConfigMain.toSun(amount);

    if (senderBalance < amountInSun) {  
      throw new Error("Insufficient balance to complete transaction");
    }

    const transaction = await tronWebConfigMain.trx.sendTransaction(receiver, amountInSun);

    console.log("✅ Transaction Successful:", transaction)
    return transaction;

  } catch (error) {
    console.error("❌ Error transferring:", error.message);
    return { success: false, message: error.message };
  }
};


export {
  TRON_GRID_API,
  TRON_MAINNET_API,
  MAIN_ACCOUNT_WALLET_ADDRESS,
  MAIN_WALLET_PRIVATE_KEY,
  getBalance,
  sendTron
};
