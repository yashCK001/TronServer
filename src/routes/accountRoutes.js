import express from "express";
import { 
    
    createSubAccount, 
    getHealthAndStatus,
    getSubAccounts

} from "../controllers/accountController.js";

const router = express.Router();

router.get('/health', getHealthAndStatus);
router.post('/create-sub', createSubAccount);
router.get('/get-sub', getSubAccounts);

export default router;