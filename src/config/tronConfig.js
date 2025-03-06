import { TronWeb } from "tronweb";

/**
 * 
 * @note Nile Testnet**
 *       For mainnet, the URL would be: "https://api.trongrid.io"
 */
const TRON_GRID_API = "https://nile.trongrid.io";

/**
 * @description TronWeb instance configured for the Main Account.
 *              This is used for performing transactions like:
 *              - Sending TRX from main to sub-accounts.
 *              - Transferring TRX or tokens between accounts.
 *              - Signing transactions (requires private key).
 *
 * @param {string} fullHost - The TronGrid API URL.
 * @param {string} privateKey - The private key of the main account (from environment variables).
 *                              This is required to sign and send transactions.
 *
 * @returns {TronWeb} A TronWeb instance with the main account's private key loaded.
 */
export const tronWebConfigMain = new TronWeb({
    fullHost: TRON_GRID_API,
    privateKey: process.env.MAIN_ACCOUNT_PRIVATE_KEY // 🔐 Required for signing transactions
});

/**
 * @description TronWeb instance for Sub-Account Management.
 *              This is used for:
 *              - Creating new sub-accounts (wallet addresses).
 *              - Fetching TRX balances of any account.
 *              - Querying blockchain data (without needing private keys).
 *
 * @param {string} fullHost - The TronGrid API URL.
 *
 */

export const tronWebConfig = new TronWeb({
    fullHost: TRON_GRID_API // No private key needed ✅
});  
