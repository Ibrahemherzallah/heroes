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
        let totalReturnedCOGS = 0;
        let totalOrderReturns = 0;

        for (const tx of transactions) {
            currentBalance += tx.amount;

            if (tx.type === "saleRevenue") {
                totalRevenue += tx.amount;
                ordersRevenue += tx.amount;
            }

            if (tx.type === "manualRevenue") {
                totalRevenue += tx.amount;
                manualRevenue += tx.amount;
            }

            if (tx.type === "deliveryRevenue") {
                totalRevenue += tx.amount;
                totalDeliveryRevenue += tx.amount;
            }

            // المرتجعات تقلل الإيرادات
            if (tx.type === "orderReturn") {
                totalRevenue += tx.amount; // amount سالب
                totalOrderReturns += Math.abs(tx.amount);
            }

            if (tx.type === "expense") {
                totalExpenses += Math.abs(tx.amount);
            }

            if (tx.type === "loss") {
                totalLosses += Math.abs(tx.amount);
            }

            // productCost عند البيع يكون سالب
            if (tx.type === "productCost") {
                if (tx.amount < 0) {
                    totalCOGS += Math.abs(tx.amount);
                } else {
                    // هذا استرجاع تكلفة بضاعة من طلب مرتجع
                    totalReturnedCOGS += tx.amount;
                }
            }
        }

        // صافي تكلفة البضاعة = تكلفة البيع - التكلفة المسترجعة
        const netCOGS = totalCOGS - totalReturnedCOGS;

        const netProfit =
            totalRevenue - netCOGS - totalExpenses - totalLosses;

        res.json({
            currentBalance,
            totalRevenue,
            totalDeliveryRevenue,
            totalExpenses,
            totalLosses,
            totalCOGS: netCOGS,
            totalOrderReturns,
            totalReturnedCOGS,
            netProfit,
            ordersRevenue,
            manualRevenue
        });
    } catch (error) {
        console.error("Finance summary error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// DELETE financial transaction
export const deleteFinancialTransaction = async (req, res) => {
    try {
        const { id } = req.params;

        const transaction = await FinancialTransaction.findById(id);

        if (!transaction) {
            return res.status(404).json({
                error: "Transaction not found",
            });
        }

        // تأكد أنه expense فقط (اختياري)
        if (transaction.type !== "expense") {
            return res.status(400).json({
                error: "Only expenses can be deleted",
            });
        }

        await transaction.deleteOne();

        res.json({
            message: "Transaction deleted successfully",
        });
    } catch (error) {
        console.error("Delete transaction error:", error);
        res.status(500).json({
            error: "Internal server error",
        });
    }
};

export const getMonthlyReport = async (req, res) => {
    try {
        const year = Number(req.query.year) || new Date().getFullYear();

        const start = new Date(`${year}-01-01T00:00:00.000Z`);
        const end = new Date(`${year + 1}-01-01T00:00:00.000Z`);

        const rawReport = await FinancialTransaction.aggregate([
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

        const monthlyMap = {};

        for (const item of rawReport) {
            const month = item._id.month;
            const type = item._id.type;
            const total = item.total;

            if (!monthlyMap[month]) {
                monthlyMap[month] = {
                    month,
                    revenue: 0,
                    deliveryRevenue: 0,
                    manualRevenue: 0,
                    orderReturns: 0,
                    cogs: 0,
                    returnedCogs: 0,
                    expenses: 0,
                    losses: 0,
                    net: 0
                };
            }

            if (type === "saleRevenue") {
                monthlyMap[month].revenue = total;
            } else if (type === "deliveryRevenue") {
                monthlyMap[month].deliveryRevenue = total;
            } else if (type === "manualRevenue") {
                monthlyMap[month].manualRevenue = total;
            } else if (type === "orderReturn") {
                monthlyMap[month].orderReturns = Math.abs(total);
            } else if (type === "productCost") {
                if (total < 0) {
                    monthlyMap[month].cogs = Math.abs(total);
                } else {
                    monthlyMap[month].returnedCogs = total;
                }
            } else if (type === "expense") {
                monthlyMap[month].expenses = Math.abs(total);
            } else if (type === "loss") {
                monthlyMap[month].losses = Math.abs(total);
            }
        }

        const report = Array.from({ length: 12 }, (_, i) => {
            const monthNumber = i + 1;

            const monthData = monthlyMap[monthNumber] || {
                month: monthNumber,
                revenue: 0,
                deliveryRevenue: 0,
                manualRevenue: 0,
                orderReturns: 0,
                cogs: 0,
                returnedCogs: 0,
                expenses: 0,
                losses: 0,
                net: 0
            };

            const totalRevenue =
                monthData.revenue +
                monthData.deliveryRevenue +
                monthData.manualRevenue -
                monthData.orderReturns;

            const netCogs = monthData.cogs - monthData.returnedCogs;

            monthData.net =
                totalRevenue -
                netCogs -
                monthData.expenses -
                monthData.losses;

            return {
                ...monthData,
                totalRevenue,
                netCogs
            };
        });

        res.json({ year, report });
    } catch (error) {
        console.error("❌ Error fetching monthly report:", error);
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