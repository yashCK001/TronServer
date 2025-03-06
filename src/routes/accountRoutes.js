import express from "express";
import { 
    
    createSubAccount, 
    getMainAccountBalance,
    getAccountBalanceWithWalletAddress,
    getAccountDetails,
    getHealthAndStatus

} from "../controllers/accountController.js";

const router = express.Router();

router.get('/health', getHealthAndStatus);
router.post('/sub-account', createSubAccount);
router.get('/main-balance', getMainAccountBalance);
router.get('/get-details', getAccountDetails);
router.post('/wallet-balance', getAccountBalanceWithWalletAddress);


export default router;