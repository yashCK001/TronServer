import { tronWebConfigMain } from "../config/tronConfig.js";
import subaccountModel from "../model/accountModel.js";
import {fetchTransactionHistory, getBalance,MAIN_ACCOUNT_WALLET_ADDRESS} from "../config/constants.js";
import {  responseHandler,HTTP_STATUS_CODES as STATUS,  HTTP_STATUS_MESSAGES as MESSAGES} from "../helpers/responseHandler.js";
import mongoose from "mongoose";
import { TronWeb } from "tronweb";


/**
 *
 * @description Get The health and status of the server
 * @route api/tron/health
 */

export const getHealthAndStatus = async (req, res) => {
  try {
    const mongoConnectionStatus =
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Error in connecting";

    let tronStatus = "Unavailable";

    try {
      const nodeInfo = await tronWebConfigMain.trx.getNodeInfo();
      tronStatus = nodeInfo ? "Connected" : "Disconnedted";
    } catch (error) {
      console.error("TRON network error:", error.message);
    }

    return responseHandler(res, STATUS.OK, MESSAGES.OK, {
      success: true,
      message: "Server is running",
      services: {
        database: mongoConnectionStatus,
        tronNetwork: tronStatus,
      },
    });
  } catch (error) {
    return responseHandler(res, STATUS.SERVER_ERROR, MESSAGES.SERVER_ERROR, {
      message: "Bad Health",
    });
  }
};

/**
 * @description Sub account wallet
 * @route /api/tron/create-sub
 */

export const createSubAccount = async (req, res) => {
  try {
    const { UID, userName } = req.body;

    //check for existing
    let existingSubAccount = await subaccountModel.findOne({ UID });

    if (existingSubAccount) {
      return responseHandler(
        res,
        STATUS.ALREADY_EXISTS,
        "Sub Accoount already exists",
        { subAccount: existingSubAccount }
      );
    }

    //since we just need to create a sub account we dont need to use the tronConfig with private key in it
    const subAccount = await tronWebConfigMain.createAccount();

    /**
     * @description we get this three values from the newSubaccount
     *              which we can use to store in the database
     *  |-address base58, hex
     *  |-privateKey
     *  |-publicKey
     */

    const subAccountWalletAddress = subAccount.address.base58;
    const subAccountPrivateKey = subAccount.privateKey;

    const newSubaccount = new subaccountModel({
      UID,
      userName,
      address: subAccountWalletAddress,
      privateKey: subAccountPrivateKey,
      mainAccountWalletAddress: MAIN_ACCOUNT_WALLET_ADDRESS,
    });

    await newSubaccount.save();

    return responseHandler(res, STATUS.CREATED, MESSAGES.CREATED, {
      "subAccount ": newSubaccount,
    });
  } catch (error) {
    console.error(`Error creating sub account : ${error}`);
    return res.status(500).json({
      success: false,
      message: "Failed to create sub account",
    });
  }
};

/**
 * @description get all sub accounts
 * @route /api/tron/get-sub-all
 */

export const getAllSubAccounts = async (req, res) => {
  try {
    let allSubAccounts = await subaccountModel.find().lean();

    if (allSubAccounts.length === 0) {
      return res.json({
        success: false,
        data: "No sub accounts found. You might want to create one.",
      });
    }

    allSubAccounts = await Promise.all(
      allSubAccounts.map(async (account) => {
        const balance = await getBalance(account.address);
        return { ...account, Balance: balance };
      })
    );

    return responseHandler(res, STATUS.CREATED, MESSAGES.CREATED, {
      SubAccounts: allSubAccounts,
    });
  } catch (error) {
    console.error(`Error occurred ${error.message}`);
    return responseHandler(res, STATUS.SERVER_ERROR, MESSAGES.SERVER_ERROR, {
      error,
    });
  }
};

/**
 * @description get sub accounts using main address
 * @route /api/tron/get-sub-id
 */

export const getSubAccountByAddress = async (req, res) => {
  try {
    const mainAccountWalletAddress = req.query.address;

    let subAccountDetails = await subaccountModel.find({
      mainAccountWalletAddress,
    }).lean();

    if (subAccountDetails.length == 0) {
      return res.json({
        success: false,
        data: "No sub accounts found you might want to create one ",
      });
    }

    subAccountDetails = await Promise.all(
      subAccountDetails.map(async (account) => {
        const balance = await getBalance(account.address);
        return { ...account, Balance: balance };
      })
    );

    return responseHandler(res, STATUS.CREATED, MESSAGES.CREATED, {
      SubAccounts: subAccountDetails,
    });
  } catch (error) {
    console.error(error);
    return responseHandler(res, STATUS.BAD_REQUEST, MESSAGES.BAD_REQUEST, {
      error,
    });
  }
};

/**
 * @description get transaction log by walletAddress
 * @route /api/tron/get-sub-all
 */

export const getTransactionHistory = async (req, res) => {
  try {
    const tronWeb = new TronWeb({
      fullHost: "https://nile.trongrid.io"
    });

    const walletAddress = req.query.address;

    let result = await fetchTransactionHistory(walletAddress);

    console.log(`Result => ${result} \n Typeof Result => ${typeof result}`);    

    if (!result.success)
      return responseHandler(res, STATUS.SERVER_ERROR, MESSAGES.SERVER_ERROR, {
        message: result.message,
      });
      
      const transactionDetails = result.transactions.map((tx) => {
        const ownerHex = tx.raw_data.contract[0]?.parameter?.value?.owner_address;
        const toHex = tx.raw_data.contract[0]?.parameter?.value?.to_address;
      
        const ownerAddress = tronWeb.address.fromHex(ownerHex);
        const toAddress = tronWeb.address.fromHex(toHex);

        let TXNtype = "unknown"; 
      
        if (ownerAddress === walletAddress) {
          TXNtype = "sent";
        } else if (toAddress === walletAddress) {
          TXNtype = "received";
        }
      
        return { ...tx, TXNtype }; 
      });
      
      result.transactions = transactionDetails;

    return responseHandler(res, STATUS.OK, MESSAGES.OK, { message: result });
  } catch (error) {
    console.error(`Error fetching transactions: ${error}`);
    return responseHandler(res, STATUS.SERVER_ERROR, MESSAGES.SERVER_ERROR, {
      data: error,
    });
  }
};

export const sendTron = async(req, res) => {

  try{

    return responseHandler(res, STATUS.OK, MESSAGES.OK, {data: "Transfer Successfull"})

  }catch(error){
    console.error(`Error in sending Tron ${error.message}`);
    return responseHandler(res, STATUS.SERVER_ERROR, MESSAGES.SERVER_ERROR, error);
  }

}