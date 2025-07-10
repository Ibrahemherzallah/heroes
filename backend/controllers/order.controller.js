// controllers/orderController.js
import Order from "../models/order.model.js";
import twilio from 'twilio';
import dotenv from 'dotenv';
dotenv.config();
// Create Order
export const createOrder = async (req, res) => {
    try {
        const {
            fullName,
            phoneNumber,
            region,
            city,
            price,
            deliveryPrice,
            numOfItems,
            products, // <-- receive array of productId + quantity
            notes,
        } = req.body;

        // Validate required fields
        if (
            !fullName ||
            !phoneNumber ||
            !region ||
            !city ||
            typeof price !== 'number' ||
            typeof deliveryPrice !== 'number' ||
            typeof numOfItems !== 'number' ||
            !Array.isArray(products) ||
            products.length === 0
        ) {
            return res.status(400).json({ error: 'Missing or invalid required fields' });
        }

        // Validate each product entry
        for (const p of products) {
            if (!p.productId || typeof p.quantity !== 'number') {
                return res.status(400).json({ error: 'Each product must include productId and quantity' });
            }
        }

        const newOrder = new Order({
            fullName,
            phoneNumber,
            region,
            city,
            price,
            deliveryPrice,
            numOfItems,
            products,
            notes,
        });

        await newOrder.save();

        res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (error) {
        console.error('Order creation error:', error);
        res.status(500).json({ error: 'Internal server error' });
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

// Delete Order
export const deleteOrder = async (req, res) => {
    try {
        const deletedOrder = await Order.findByIdAndDelete(req.params.id);
        if (!deletedOrder) return res.status(404).json({ message: "Order not found" });
        res.status(200).json({ message: "Order deleted" });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
            to: 'whatsapp:+972592572788',
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
            to: 'whatsapp:+972592572788',
            body: message
        });

        console.log('Message sent:', response.sid);
        res.status(200).json({ message: 'تم إرسال رسالة واتساب بنجاح' });
    } catch (error) {
        console.error('خطأ في إرسال واتساب:', error);
        res.status(500).json({ message: 'فشل إرسال الرسالة', error: error.message });
    }
};