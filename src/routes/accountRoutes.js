import express from "express";
import { 
    
    createSubAccount, 
    getHealthAndStatus,
    getSubAccountByAddress,
    getAllSubAccounts,
    getTransactionHistory

} from "../controllers/accountController.js";

const router = express.Router();

router.get('/health', getHealthAndStatus);
router.post('/create-sub', createSubAccount);
router.get('/get-sub-all', getAllSubAccounts);
router.get('/get-sub-id', getSubAccountByAddress);
router.get('/transactions', getTransactionHistory);

export default router;