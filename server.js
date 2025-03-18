import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cloudiary from 'cloudinary';

import connectDB from './config/db.js';

//dot env config
dotenv.config();

//database connection
connectDB();

//cloudinary config
cloudiary.v2.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
})

//rest object
const app = express();

//middleware
app.use(morgan('dev'));
app.use(express.json());
// app.use(cors({credentials: true,}));
app.use(cookieParser());
app.use(cors({
    origin: "*", // Hoặc thêm chính xác IP frontend: "http://192.168.x.x:8081"
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

//route
//routes import
import testRoutes from './routes/testRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";

app.use('/api/v1', testRoutes);
app.use('/api/v1/user', userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/brand', brandRoutes);


app.get('/', (req, res) => {
    return res.status(200).send("<h1>API is running</h1>");
});

//port
const PORT = process.env.PORT || 5000;

//listen
app.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} on ${process.env.NODE_ENV} Mode`.bgMagenta.white);
});