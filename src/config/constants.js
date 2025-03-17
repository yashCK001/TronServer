import {config} from "dotenv";
import { tronWebConfigMain } from "./tronConfig.js";
import { TronWeb } from "tronweb";
config();


const TRON_GRID_API = "https://nile.trongrid.io";
const TRON_MAINNET_API = "https://api.trongrid.io";
const USDT_CONTRACT_ADDRESS = process.env.USDT_CONTRACT_ADDRESS;

const MAIN_WALLET_PRIVATE_KEY = process.env.MAIN_WALLET_PRIVATE_KEY;
const MAIN_ACCOUNT_WALLET_ADDRESS = process.env.MAIN_ACCOUNT_WALLET_ADDRESS;

const getTRXBalance = async (walletAddress) => {
  
      const balanceInSun = await tronWebConfigMain.trx.getBalance(walletAddress);
      const balanceInTRX = tronWebConfigMain.fromSun(balanceInSun);
      return balanceInTRX;
}


// const getUSDTBalance = async (walletAddress) => {
  
//   try {

//     const privatKey = "41" + "0".repeat(64);

    // const subAccountTronWebConfig = new TronWeb({
    //   fullHost: TRON_GRID_API,
    //   privateKey: MAIN_WALLET_PRIVATE_KEY
    // })

//     const contract = await subAccountTronWebConfig
//     .contract()
//     .at(USDT_CONTRACT_ADDRESS);
    
//     const balanceInSun = await contract.methods.balanceOf(walletAddress).call();
//     const balanceInUSDT = parseInt(balanceInSun) / 1000000;
    
//     return balanceInUSDT;
//   }catch(error){
//     console.error(error);
//   }
// }


const subAccountTronWebConfig = new TronWeb({
  fullHost: TRON_GRID_API,
  privateKey: MAIN_WALLET_PRIVATE_KEY
})

 const getUSDTBalance = async (walletAddress) => {
  try {
    const contract = await subAccountTronWebConfig.contract().at(USDT_CONTRACT_ADDRESS);

    const walletHex = TronWeb.address.toHex(walletAddress); // Convert to Hex
    const balanceInSun = await contract.methods.balanceOf(walletHex).call();

    return Number(balanceInSun) / 1_000_000; // Convert from SUN to USDT
  } catch (error) {
    console.error("Error fetching USDT balance:", error);
    return 0;
  }
};

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

const fetchTransactionHistory = async (walletAddress) => {

  try{

     if(!walletAddress) throw new Error("Please provide wallet addres");

     const transactionUrl = `${TRON_GRID_API}/v1/accounts/${walletAddress}/transactions`;
     const response = await fetch(transactionUrl);
  
     if(!response.ok) throw new Error(`Failed to fetch transactions ${response.status}`);

     const data = await response.json();
     
    //  return {success: true, transactions: data}
     return {success: true, transactions: data.data}

  }catch(error){
      console.error(`Error fetching transaction ${error.message}`)
      return {success: false, message: error.message}
  }

}


// const transferUSDT = async (receiver, amountUSDT) => {

//   try {

//     //checking if the account where the user is recieving is actaully on tron or not 
//     // because transfer main account me hoga toh hume sirf address confirm karwana hai -> basically wallet check krwana hai
//     if(!tronWebConfigMain.isAddress(receiver)){
//       throw new Error(`Invalid tron address provided : ${receiver}`);
//     }

//     console.log(`🔹 Transferring ${amount} USDT to ${receiver}...`);

//     //contract address of usdt for interacting with it
//     const USDT_ContractAdrress = "TXYZopYRdj2D9XRtbG411XZZ3kM5VkAeBf";
//     const contract  = await tronWebConfigMain.contract().at(USDT_ContractAdrress);



//   }catch(error){
//     console.error(`Error while transferring : ${error}`);
//   }

// }

export {
  TRON_GRID_API,
  TRON_MAINNET_API,
  MAIN_ACCOUNT_WALLET_ADDRESS,
  MAIN_WALLET_PRIVATE_KEY,
  USDT_CONTRACT_ADDRESS,
  getTRXBalance,
  getUSDTBalance,
  sendTron,
  fetchTransactionHistory
};
