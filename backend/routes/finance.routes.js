import express from "express";
import {
    addExpense, addManualTransaction,
    addOpeningBalance, deleteFinancialTransaction,
    getFinanceSummary,
    getFinancialTransactions, getInventoryTransactions,
    getMonthlyReport
} from "../controllers/finance.controller.js";
import {authenticate} from "../middleware/authMiddleware.js";
import {authorizeAdmin} from "../middleware/authorizeAdmin.js";

const router = express.Router();

router.get("/summary",authenticate, authorizeAdmin, getFinanceSummary);
router.post("/expense",authenticate, authorizeAdmin, addExpense);
router.post("/manual-transaction",authenticate, authorizeAdmin, addManualTransaction);
router.get("/monthly-report", authenticate, authorizeAdmin,getMonthlyReport);
router.get("/transactions-finance",authenticate, authorizeAdmin, getFinancialTransactions);
router.get("/transactions", authenticate, authorizeAdmin, getFinancialTransactions);
router.get("/transactions-inventory",authenticate, authorizeAdmin, getInventoryTransactions);
router.post("/opening-balance",authenticate, authorizeAdmin,addOpeningBalance);
router.delete("/transactions/:id",authenticate, authorizeAdmin, deleteFinancialTransaction);
export default router;