import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import connectMongoDB from "./db/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";

const app = express();
const PORT = process.env.PORT || 4040;


app.use(cors());
dotenv.config();

app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/product',productRoutes);
app.use('/api/category',categoryRoutes);
app.use('/api/order',orderRoutes);


app.listen(PORT , ()=> {
    connectMongoDB()
    console.log(`Server is running on http://localhost:${PORT}`);
});
