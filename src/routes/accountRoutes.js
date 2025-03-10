import express from "express";
import { 
    
    createSubAccount, 
    getHealthAndStatus,
    getSubAccountByAddress,
    getAllSubAccounts

} from "../controllers/accountController.js";

const router = express.Router();

router.get('/health', getHealthAndStatus);
router.post('/create-sub', createSubAccount);
router.get('/get-sub-all', getAllSubAccounts);
router.get('/get-sub-id', getSubAccountByAddress);

export default router;