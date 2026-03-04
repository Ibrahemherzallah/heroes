import Order from "../models/order.model.js";
import User from "../models/user.model.js";
import twilio from 'twilio';
import dotenv from 'dotenv';
import Product from "../models/product.model.js";
dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';



export const createOrder = async (req, res) => {
    try {
        const {fullName, phoneNumber, region, city, price, deliveryPrice, numOfItems, products, notes, source, usedPoints } = req.body;

        if (!fullName || !phoneNumber || !region || !city || typeof price !== "number" || typeof deliveryPrice !== "number" || typeof numOfItems !== "number" || !Array.isArray(products) || products.length === 0) {
            return res.status(400).json({ error: "Missing or invalid required fields" });
        }

        const formattedProducts = [];

        // ===============================
        // 🔥 STOCK + SNAPSHOT
        // ===============================
        for (const item of products) {
            if (!item.id || typeof item.quantity !== "number") {
                return res.status(400).json({
                    error: "Each product must include id and quantity",
                });
            }

            const product = await Product.findById(item.id);
            if (!product) {
                return res.status(404).json({
                    error: `Product not found: ${item.id}`,
                });
            }

            if (product.type === "inStore") {
                if (product.stock < item.quantity) {
                    return res.status(400).json({
                        error: `لا يوجد مخزون كافي للمنتج  ${product.productName}`,
                    });
                }

                product.stock -= item.quantity;
                if (product.stock === 0) product.isSoldOut = true;
                await product.save();
            }

            formattedProducts.push({
                productId: product.id,
                name: product.productName,
                image: product.image?.[0] || "",
                price: item.price,
                quantity: item.quantity,
            });
        }

        // ===============================
        // 🎁 POINTS LOGIC (ONLY ONCE)
        // ===============================

        let finalUsedPoints = 0;
        let earnedPoints = 0;
        let updatedUser = null;

        const totalAmount = price + deliveryPrice;

        if (req.user && req.user.role === "user") {

            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }

            // ✅ Validate discount points
            if (usedPoints > 0) {
                if (usedPoints > user.points) {
                    return res.status(400).json({
                        error: "Not enough points",
                    });
                }

                finalUsedPoints = usedPoints;
                console.log("finalUsedPoints is : ", finalUsedPoints)
                user.points -= finalUsedPoints;
            }

            // ✅ Earn new points after discount
            const paidAmount = totalAmount - finalUsedPoints;
            earnedPoints = Math.floor(paidAmount / 100);
            console.log("earnedPoints is : ", earnedPoints)
            user.points += earnedPoints;

            updatedUser = await user.save();
        } else if (req.user && req.user.role === "wholesaler") {
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({ error: "User not found" });
            }
            updatedUser = await user.save();
        }

        let orderNumber = null;

        if (req.user) {
            const userOrdersCount = await Order.countDocuments({
                userId: req.user._id
            });
            orderNumber = userOrdersCount + 1;
        }
        // ===============================
        // ✅ CREATE ORDER
        // ===============================

        const newOrder = await Order.create({
            fullName,
            phoneNumber,
            region,
            city,
            price,
            deliveryPrice,
            numOfItems,
            source,
            products: formattedProducts,
            notes,
            usedPoints: finalUsedPoints,
            earnedPoints,
            userId: req.user?._id || null,
            orderNumber
        });

        // Push order to user history
        if (updatedUser) {
            updatedUser.orderHistory.push(newOrder._id);
            await updatedUser.save();
        }

        res.status(201).json({
            message: "Order created successfully",
            order: newOrder,
            user: updatedUser   // 🔥 IMPORTANT: return updated user
        });

    } catch (error) {
        console.error("Order creation error:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};
// Get All Orders
export const getAllOrders = async (req, res) => {
    try {
        const orders = await Order.find().sort({ createdAt: -1 });
        res.json(orders);
    } catch (err) {
        console.error('Failed to fetch orders', err);
        res.status(500).json({ error: 'Internal server error' });
    }
};

// Get Order by ID
export const getOrderById = async (req, res) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// Update Order
export const updateOrder = async (req, res) => {
    try {
        const updatedOrder = await Order.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedOrder) return res.status(404).json({ message: "Order not found" });
        res.status(200).json(updatedOrder);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
};

export const updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!['ordered', 'shipped', 'delivered'].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        order.status = status;

        if (status === "shipped") {
            order.shippedAt = new Date();
        }

        if (status === "delivered") {
            order.deliveredAt = new Date();
        }

        await order.save();

        res.json({ message: "Order updated", order });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};
// Delete Order
export const deleteOrder = async (req, res) => {
    try {
        const { id } = req.params;

        const order = await Order.findById(id);
        if (!order) {
            return res.status(404).json({ error: "Order not found" });
        }

        await Order.findByIdAndDelete(id);

        res.json({ message: "Order deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Server error" });
    }
};

export const getMyOrders = async (req, res) => {
    try {
        console.log("user req is : ", req.user);
        console.log("user user._id is : ", req.user._id);
        // const orders = await Order.find({
        //     _id: { $in: req.user.orderHistory }
        // }).sort({ createdAt: -1 });
        const orders = await Order.find({ _id: { $in: req.user.orderHistory } })
            .sort({ createdAt: -1 })
            .populate("products.productId");

        res.json({ orders });
    } catch (error) {
        console.error("Get my orders error:", error);
        res.status(500).json({ error: "حدث خطأ أثناء جلب الطلبات" });
    }
};

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = twilio(accountSid, authToken);


export const sendWhatsAppMessage = async (req, res) => {
    const {
        fullName, phoneNumber, city, region, notes, price,
        numOfItems, deliveryPrice, products, source = 'Heroes Store'
    } = req.body;

    const productLines = products.map(p =>
        `• المنتج: ${p.productId} × ${p.quantity}`
    ).join('\n');

    const message = `طلب جديد من ${source}
                            الاسم: ${fullName}
                            رقم الهاتف: ${phoneNumber}
                            المدينة: ${city}
                            المنطقة: ${region}
                            ملاحظات: ${notes || 'لا يوجد'}
                            عدد المنتجات: ${numOfItems}
                            السعر الإجمالي: ${price}₪
                            رسوم التوصيل: ${deliveryPrice}₪
                            المنتجات:
                            ${productLines}`;

    try {
        const response = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
            to: 'whatsapp:+972597250539',
            body: message
        });

        console.log('Message sent:', response.sid);
        res.status(200).json({ message: 'تم إرسال رسالة واتساب بنجاح' });
    } catch (error) {
        console.error('خطأ في إرسال واتساب:', error);
        res.status(500).json({ message: 'فشل إرسال الرسالة', error: error.message });
    }
};



export const sendContactUsMessage = async (req, res) => {
    const {
        fullName,
        phoneNumber,
        subject,
        email,
        notes,
        source = 'رسالة من صفحة اتصل بنا'
    } = req.body;

    const message = `رسالة جديدة من ${source}
الاسم: ${fullName}
رقم الهاتف: ${phoneNumber}
البريد الإلكتروني: ${email}
الموضوع: ${subject}
الرسالة:${notes}`;

    try {
        const response = await client.messages.create({
            from: `whatsapp:${process.env.TWILIO_WHATSAPP_FROM}`,
            to: 'whatsapp:+972597250539',
            body: message
        });

        console.log('Message sent:', response.sid);
        res.status(200).json({ message: 'تم إرسال رسالة واتساب بنجاح' });
    } catch (error) {
        console.error('خطأ في إرسال واتساب:', error);
        res.status(500).json({ message: 'فشل إرسال الرسالة', error: error.message });
    }
};