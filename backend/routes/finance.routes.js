import express from "express";
import {
    addExpense, addManualTransaction,
    addOpeningBalance,
    getFinanceSummary,
    getFinancialTransactions, getInventoryTransactions,
    getMonthlyReport
} from "../controllers/finance.controller.js";

const router = express.Router();

router.get("/summary",getFinanceSummary);
router.post("/expense",addExpense);
router.post("/manual-transaction", addManualTransaction);
router.get("/monthly-report", getMonthlyReport);
router.get("/transactions-finance", getFinancialTransactions);
router.get("/transactions", getFinancialTransactions);
router.get("/transactions-inventory", getInventoryTransactions);
router.post("/opening-balance",addOpeningBalance);

export default router;