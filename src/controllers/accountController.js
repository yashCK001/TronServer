import { tronWebConfigMain} from "../config/tronConfig.js";
import subaccountModel from "../model/accountModel.js"
import { MAIN_ACCOUNT_WALLET_ADDRESS, fetchBalance } from "../config/constants.js";
import { responseHandler, HTTP_STATUS_CODES as STATUS, HTTP_STATUS_MESSAGES as MESSAGES } from "../helpers/responseHandler.js";
import mongoose from "mongoose";

/**
 * 
 * @description Get TRX balance  
 * @route api/tron/balance
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

export const getMainAccountBalance = async (req, res) => {
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


/**
 * @description Sub account wallet
 * @route /api/tron/create
 */

export const createSubAccount = async (req, res) => {
  try {

    const {U_ID, userName} = req.body;

    //until unless hume jaroorat hai account se transaction karne ki 
    // we dont need to use the config with the private key 
    const subAccount = await tronWebConfigMain.createAccount();
    
    /**
     * @description we get this three values from the newSubaccount
     *              which we can use to store in the database
     *  |-address
     *  |-privateKey
     *  |-publicKey
    */
   
   const subAccountwalletAddress = subAccount.address.base58;
   const subAccountprivateKey = subAccount.privateKey;
   
   //by default the wallet balance is will be zero as it just got created
   const balance = await fetchBalance(subAccountwalletAddress);

    const newSubaccount = new subaccountModel({
      address: subAccountwalletAddress,
      privateKey: subAccountprivateKey,
      mainAccountWalletAddress: MAIN_ACCOUNT_WALLET_ADDRESS,
      balance: balance,
      userName,
      U_ID
    })

    await newSubaccount.save();
    
    return res.status(200).json({
      success: true,
      message: "Sub-Account created successfully",
      data: newSubaccount,
    
    });

  } catch (error) {
    console.error(`Error creating sub account : ${error}`);
    return res.status(500).json({ 
      success: false,
      message: "Failed to create sub account",
    });
  }
};

export const getAccountDetails = async (req, res) => {

  const mainAccountWalletAddress = "TBRo4SycPuurP872iV6rdttuYeFa2DUNyz";

  const subAccountDetails = await subaccountModel.find({mainAccountWalletAddress});

  const mainAccountBalance = await fetchBalance(mainAccountWalletAddress);

  if(subAccountDetails.length == 0){

    return res.json({
      success: false,
      data: "No sub accounts found you might want to create one ",
      accountBalance: mainAccountBalance

    })
  }
    return res.json({
      success: true,
      data: {subAccountDetails , 
        accountBalance: mainAccountBalance
      }
    })
  }




