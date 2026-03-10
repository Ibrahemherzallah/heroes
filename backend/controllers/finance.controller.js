import FinancialTransaction from "../models/financial.model.js";
import StoreBalance from "../models/storeBalance.model.js";
import InventoryTransaction from "../models/inventory.model.js";
export const addExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;

        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const tx = await FinancialTransaction.create({
            type: "expense",
            amount: -Math.abs(amount),
            description,
            category: category || "other",
            createdBy: req.user?._id
        });

        res.status(201).json({
            message: "Expense added successfully",
            transaction: tx
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getFinanceSummary = async (req, res) => {
    try {
        const transactions = await FinancialTransaction.find();

        let currentBalance = 0;
        let totalRevenue = 0;
        let ordersRevenue = 0;
        let manualRevenue = 0;
        let totalDeliveryRevenue = 0;
        let totalExpenses = 0;
        let totalLosses = 0;
        let totalCOGS = 0;

        for (const tx of transactions) {
            currentBalance += tx.amount;

            if (tx.type === "saleRevenue" || tx.type === 'manualRevenue' || tx.type === "deliveryRevenue") {
                totalRevenue += tx.amount;
            }

            if (tx.type === "saleRevenue") {
                ordersRevenue += tx.amount;
            }

            if (tx.type === "manualRevenue") {
                manualRevenue += tx.amount;
            }

            if (tx.type === "deliveryRevenue") {
                totalDeliveryRevenue += tx.amount;
            }

            if (tx.type === "expense") {
                totalExpenses += Math.abs(tx.amount);
            }

            if (tx.type === "loss") {
                totalLosses += Math.abs(tx.amount);
            }

            if (tx.type === "productCost" || tx.type === 'loss') {
                totalCOGS += Math.abs(tx.amount);
            }
        }

        const netProfit = totalRevenue  - totalCOGS - totalExpenses;
        console.log("netProfit os : " , netProfit)
        console.log("totalRevenue os : " , totalRevenue)
        console.log("totalDeliveryRevenue os : " , totalDeliveryRevenue)
        console.log("totalCOGS os : " , totalCOGS)
        console.log("totalExpenses os : " , totalExpenses)
        console.log("totalLosses os : " , totalLosses)

        res.json({
            currentBalance,
            totalRevenue,
            totalDeliveryRevenue,
            totalExpenses,
            totalLosses,
            totalCOGS,
            netProfit,
            ordersRevenue,
            manualRevenue
        });
    } catch (error) {
        console.error("Finance summary error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getMonthlyReport = async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();

        const start = new Date(`${year}-01-01T00:00:00.000Z`);
        const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        const report = await FinancialTransaction.aggregate([
            {
                $match: {
                    createdAt: { $gte: start, $lt: end }
                }
            },
            {
                $group: {
                    _id: {
                        month: { $month: "$createdAt" },
                        type: "$type"
                    },
                    total: { $sum: "$amount" }
                }
            },
            {
                $sort: {
                    "_id.month": 1
                }
            }
        ]);

        res.json({ year, report });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};

export const addManualTransaction = async (req, res) => {
    try {
        const { type, amount, description, category } = req.body;

        const allowedTypes = ["expense", "manualRevenue", "openingBalance", "capitalInjection", "withdrawal"];

        if (!allowedTypes.includes(type)) {
            return res.status(400).json({ error: "Invalid transaction type" });
        }

        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        let finalAmount = amount;

        if (type === "expense" || type === "withdrawal") {
            finalAmount = -Math.abs(amount);
        } else {
            finalAmount = Math.abs(amount);
        }

        const transaction = await FinancialTransaction.create({
            type,
            amount: finalAmount,
            description,
            category: category || "other",
            createdBy: req.user?._id
        });

        res.status(201).json({
            message: "Transaction added successfully",
            transaction
        });
    } catch (error) {
        console.error("Add manual transaction error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const getFinancialTransactions = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;
        const type = req.query.type;

        const filter = {};

        if (type) {
            filter.type = type;
        }

        const transactions = await FinancialTransaction
            .find(filter)
            .populate("orderId", "orderNumber fullName price")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await FinancialTransaction.countDocuments(filter);

        res.json({
            transactions,
            total,
            page,
            pages: Math.ceil(total / limit)
        });
    } catch (error) {
        console.error("Fetch financial transactions error:", error);

        res.status(500).json({
            error: "Internal server error"
        });
    }
};

export const getInventoryTransactions = async (req, res) => {
    try {

        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 50;

        const transactions = await InventoryTransaction
            .find()
            .populate("productId", "productName image")
            .populate("orderId", "orderNumber")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        const total = await InventoryTransaction.countDocuments();

        res.json({
            transactions,
            total,
            page,
            pages: Math.ceil(total / limit)
        });

    } catch (error) {

        console.error("Fetch inventory transactions error:", error);

        res.status(500).json({
            error: "Internal server error"
        });

    }
};

export const addOpeningBalance = async (req, res) => {
    try {
        const { amount, description } = req.body;

        if (typeof amount !== "number" || amount <= 0) {
            return res.status(400).json({ error: "Invalid amount" });
        }

        const tx = await FinancialTransaction.create({
            type: "openingBalance",
            amount,
            description: description || "Opening balance",
            createdBy: req.user?._id
        });

        res.status(201).json({
            message: "Opening balance added successfully",
            transaction: tx
        });
    } catch (error) {
        res.status(500).json({ error: "Internal server error" });
    }
};