import { TronWeb } from "tronweb";
import { config } from "dotenv";
config();

/**
 * @note Nile Testnet**
 *       For mainnet, the URL would be: "https://api.trongrid.io"
 */
const TRON_GRID_API = "https://nile.trongrid.io";

/**
 * @description Creates a new TronWeb instance dynamically.
 *              This can be used for main accounts, sub-accounts, or any wallet requiring transactions.
 *
 * @param {string} privateKey - The private key for the wallet (if signing transactions is required).
 * @returns {TronWeb} - A new TronWeb instance.
 */
const createTronWebInstance = (privateKey = null) => {
    return new TronWeb({
        fullHost: TRON_GRID_API,
        privateKey: privateKey || undefined, // If no private key, instance is read-only
    });
};

/**
 * @description TronWeb instance configured for the Main Account.
 *              This is used for performing transactions like:
 *              - Sending TRX from main to sub-accounts.
 *              - Transferring TRX or tokens between accounts.
 *              - Signing transactions (requires private key).
 */
export const tronWebConfigMain = createTronWebInstance(process.env.MAIN_WALLET_PRIVATE_KEY);

/**
 * @description TronWeb instance for read-only blockchain interactions.
 *              Used for:
 *              - Fetching TRX balances of any account.
 *              - Querying blockchain data without needing private keys.
 */
export const tronWebConfig = createTronWebInstance();

export { createTronWebInstance, TRON_GRID_API };
