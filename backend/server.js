import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors'
import connectMongoDB from "./db/connectDB.js";
import authRoutes from "./routes/auth.routes.js";
import productRoutes from "./routes/product.routes.js";
import categoryRoutes from "./routes/category.routes.js";
import orderRoutes from "./routes/order.routes.js";
import {fileURLToPath} from "url";
import path from "path";

const app = express();
const PORT = process.env.PORT || 4040;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors({
    origin: ['http://localhost:8080','https://heroess.top'],
    credentials: true
}));
dotenv.config();

app.use(express.json());

app.use('/api/auth',authRoutes);
app.use('/api/product',productRoutes);
app.use('/api/category',categoryRoutes);
app.use('/api/order',orderRoutes);
const staticPath = path.join(__dirname, 'static');
app.use(express.static(staticPath));

app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) {
        return next(); // Skip this handler for API routes
    }
    res.sendFile(path.join(staticPath, 'index.html'));
});

try {
    app.listen(PORT, () => {
        connectMongoDB();
        console.log(`Server is running on http://localhost:${PORT}`);
    });
} catch (err) {
    console.error('Error starting server:', err);
}