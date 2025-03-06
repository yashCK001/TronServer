import {config} from "dotenv";
import { tronWebConfigMain } from "./tronConfig.js";
config();

const TRON_GRID_API = "https://nile.trongrid.io";
const TRON_MAINNET_API = "https://api.trongrid.io";
const MAIN_WALLET_PRIVATE_KEY = process.env.MAIN_WALLET_PRIVATE_KEY;
const MAIN_ACCOUNT_WALLET_ADDRESS = process.env.MAIN_ACCOUNT_WALLET_ADDRESS;

const fetchBalance = async (walletAddress) => {
      const balanceInSun = await tronWebConfigMain.trx.getBalance(walletAddress);
      const balanceInTRX = tronWebConfigMain.fromSun(balanceInSun);
      return balanceInTRX
}

export {
  TRON_GRID_API,
  TRON_MAINNET_API,
  MAIN_ACCOUNT_WALLET_ADDRESS,
  MAIN_WALLET_PRIVATE_KEY,
  fetchBalance
};
