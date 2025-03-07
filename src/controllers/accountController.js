import { tronWebConfigMain} from "../config/tronConfig.js";
import subaccountModel from "../model/accountModel.js"
import { MAIN_ACCOUNT_WALLET_ADDRESS, getBalance } from "../config/constants.js";
import { responseHandler, HTTP_STATUS_CODES as STATUS, HTTP_STATUS_MESSAGES as MESSAGES } from "../helpers/responseHandler.js";
import mongoose from "mongoose";

/**
 * 
 * @description Get The health and status of the server
 * @route api/tron/health
 */

export const getHealthAndStatus = async(req, res) => {
  try {

    const mongoConnectionStatus = mongoose.connection.readyState === 1 ? "Connected" : "Error in connecting"
    
    let tronStatus = "Unavailable";

      try {
        const nodeInfo = await tronWebConfigMain.trx.getNodeInfo();
        tronStatus = nodeInfo ? "Connected" : "Disconnedted";
      }catch(error){
        console.error("TRON network error:", error.message);
      }
      
      return responseHandler(res, STATUS.OK, MESSAGES.OK, {
        success: true,
        message: "Server is running",
        services : {
          database: mongoConnectionStatus,
          tronNetwork: tronStatus
        }
      })
      
    }catch(error){
      return responseHandler(res, STATUS.SERVER_ERROR, MESSAGES.SERVER_ERROR, {
        success: false,
        message: "Bad Health"
      })
    }
}

/**
 * @description Sub account wallet
 * @route /api/tron/create-sub
 */

export const createSubAccount = async (req, res) => {
  try {

    const {UID, userName} = req.body;

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
    })

    await newSubaccount.save();
    
    return responseHandler(res, STATUS.CREATED, MESSAGES.CREATED, {"Sub Account ": newSubaccount});

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
 * @route /api/tron/get-sub
 */

export const getSubAccounts = async (req, res) => {
  
  const mainAccountWalletAddress = req.query.address;

  const subAccountDetails = await subaccountModel.find({mainAccountWalletAddress});
  
  if(subAccountDetails.length == 0){

    return res.json({
      success: false,
      data: "No sub accounts found you might want to create one "
    })
  }
    return responseHandler(res, STATUS.CREATED, MESSAGES.CREATED, {SubAccounts : subAccountDetails})
  }

/**
 OMIT
 
export const getAccountBalance = async (req, res) => {
  try{

    console.log(" Main Account Wallet Address", MAIN_ACCOUNT_WALLET_ADDRESS);

    const balanceInDefault = await tronWebConfigMain.trx.getBalance(MAIN_ACCOUNT_WALLET_ADDRESS); // this will be in sun by default

    const balanceInTRX = tronWebConfigMain.fromSun(balanceInDefault);

    return responseHandler(res, HTTP_STATUS_CODES.OK, HTTP_STATUS_MESSAGES.OK, {
      "Balance in sun": balanceInDefault,
      "balance in TRX": balanceInTRX
    });

  }catch(error){
    console.error(`Error ${error.getMessage}`)
    return res.json({sucess: false, message: "Error fetching balance"});
  }
}

export const getAccountBalanceWithWalletAddress = async (req, res) => {
  try {
    const { walletAddress } = req.body;

    // Validate wallet address
    if (!walletAddress) {
      return responseHandler(res, HTTP_STATUS_CODES.BAD_REQUEST.code, HTTP_STATUS_MESSAGES.BAD_REQUEST, "Wallet address is required");
    }

    // Fetch balance in SUN and convert to TRX
    const balanceInSun = await tronWebConfigMain.trx.getBalance(walletAddress);
    const balanceInTRX = tronWebConfigMain.fromSun(balanceInSun);

    return responseHandler(res, STATUS.OK.code, MESSAGES.OK, {
      "Balance in sun": balanceInSun,
      "Balance in TRX": balanceInTRX
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
    return res.json({ success: false, message: "Error fetching balance" });
  }
};

*/





