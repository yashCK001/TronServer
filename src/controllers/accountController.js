import { tronWebConfigMain } from "../config/tronConfig.js";
import subaccountModel from "../model/accountModel.js";

import {
  fetchTransactionHistory,
  MAIN_ACCOUNT_WALLET_ADDRESS,
  USDT_CONTRACT_ADDRESS,
  TRON_GRID_API,
  getUSDTBalance,
  getTRXBalance
} from "../config/constants.js";

import {
  responseHandler,
  HTTP_STATUS_CODES as STATUS,
  HTTP_STATUS_MESSAGES as MESSAGES,
} from "../helpers/responseHandler.js";

import mongoose from "mongoose";
import { TronWeb } from "tronweb";
import { config } from "dotenv";
config();

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
``
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
        const usdtBalance = await getUSDTBalance(account.address)
        return { ...account, USDTBalance: usdtBalance };
        // return { ...account  };
      })
    );
    
    const usdtBalance = await getUSDTBalance("TQjBvZ21pmnKg5UFfpzNuMTuPBy4T7PbJr")
    console.log(usdtBalance);

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

    let subAccountDetails = await subaccountModel
      .find({
        mainAccountWalletAddress,
      })
      .lean();

    if (subAccountDetails.length == 0) {
      return res.json({
        success: false,
        data: "No sub accounts found you might want to create one ",
      });
    }

    subAccountDetails = await Promise.all(
      subAccountDetails.map(async (account) => {

        const USDT = await getUSDTBalance(account.address);
        const TRX = await getTRXBalance(account.address);

        return { ...account, USDTBalance: USDT, TRXbalance: TRX};

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
      fullHost: "https://nile.trongrid.io",
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

// send usdt

export const sendUSDTfromSubAccount = async (req, res) => {

  try {
    const { amountInUSDT, address } = req.body;

    /*
    Search from the mongoDB 
      - private key
      - mainWalletAddress associated with the walletAddress
    */

    const result = await subaccountModel.findOne({address})

    if(!result) {
      return responseHandler(res, STATUS.NOT_FOUND, MESSAGES.NOT_FOUND, {
        data: "Sub account not found"
      })};

    const senderPrivateKey = result.privateKey;
    const mainWalletAddress = result.mainAccountWalletAddress;

    const subAccountTronWebConfig = new TronWeb({
      fullHost: TRON_GRID_API,
      privateKey: senderPrivateKey,
    });
  

    if (!amountInUSDT || isNaN(amountInUSDT) || amountInUSDT <= 0) {
      return responseHandler(res, STATUS.BAD_REQUEST, MESSAGES.BAD_REQUEST, {
        data: `${amountInUSDT} is in wrong format`,
      });
    }

    // multplying it to 100000 => 1USDT = 1000000 SUN
    const amountInSun = amountInUSDT * 1000000;

    const contract = await subAccountTronWebConfig
      .contract()
      .at(USDT_CONTRACT_ADDRESS);

    /**
     * fetch the 
     *  - UDTbalance - which is to be transferred
     *  - TRXBalance - required as transaction fee for transferring USDT
     */
    
    const balanceInUSDT = await getUSDTBalance(address);
    const balanceInTRX = await getTRXBalance(address);

    console.log(`🔹 Sub-Account USDT Balance: ${balanceInUSDT} USDT`);
    console.log(`🔹 Sub-Account TRX Balance: ${balanceInTRX} TRX`);

    /**
     * hume check karna padega that if we have enough
     *    - USDT to transfer
     *    - enough TRX for transaction fee
     *    - if not enough TRX then request to gas wallet for TRX - Later
     */

    let transactionFee;
    
    try{

      const parameter = [
        {type: "address", value: mainWalletAddress},
        {type: "uint256", value: amountInSun.toString()}
      ]

      const functionSelector = "transfer(address,uint256)";

      const estimatedEnergy = await subAccountTronWebConfig.transactionBuilder.estimateEnergy(address, USDT_CONTRACT_ADDRESS, functionSelector, parameter)
    
      console.log(`🔹 Estimated Energy: ${estimatedEnergy}`);
     

    }catch(error){
      console.error("⚠️ Error estimating energy:", error);
    }

    /*
    const transactionFee = await contract.methods.transfer(mainWalletAddress, amountInSun).estimateEnergy();
    const estimatedEnergy = transactionFee.energy_used; 
    const estimatedFeeInSun = estimatedEnergy * 420;
    const estimatedFeeInTRX = subAccountTronWebConfig.fromSun(estimatedFeeInSun);
    */

    console.log(`🔹 Estimated TRX Fee: ${transactionFee} TRX`);

    if (balanceInUSDT < amountInUSDT) {
      if(balanceInTRX < estimatedFeeInTRX){
        return responseHandler(res, STATUS.BAD_REQUEST, MESSAGES.BAD_REQUEST, {data: "In sufficient TRX for transferring USDT"});
      }
      return responseHandler(res, STATUS.BAD_REQUEST, MESSAGES.BAD_REQUEST, { data: "In sufficient balance",});
    }

    console.log(`🔹 Sending ${amountInUSDT} USDT from Sub-Account to ${mainWalletAddress}...`);

    const transaction = await contract.methods.transfer(mainWalletAddress, amountInSun).send();

    if (!transaction) throw new Error("Error transferring USDt");

  
    console.log("✅ USDT Transfer Successful:", transaction);
    return responseHandler(res, STATUS.OK, MESSAGES.OK, { data: transaction });

  } catch (error) {
    console.error(`Error in sending USDT : ${error}`);
    return responseHandler(
      res,
      STATUS.SERVER_ERROR,
      MESSAGES.SERVER_ERROR,
      error
    );
  }
};

