import cron from "node-cron";
import Order from "../models/order.model.js";

cron.schedule("0 0 * * *", async () => {
    try {
        const fiveDaysAgo = new Date();
        fiveDaysAgo.setDate(fiveDaysAgo.getDate() - 5);

        const orders = await Order.find({
            status: "shipped",
            shippedAt: { $lte: fiveDaysAgo },
        });

        for (const order of orders) {
            order.status = "delivered";
            order.deliveredAt = new Date();
            await order.save();
        }

        console.log("Auto delivered orders updated");
    } catch (error) {
        console.error("Cron error:", error);
    }
});