import express from 'express';
import colors from 'colors';
import morgan from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import cloudiary from 'cloudinary';

import connectDB from './config/db.js';

import http from 'http';
import { Server } from 'socket.io';

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

//create http server for app - handle socket.io
const server = http.createServer(app);
//create socket.io server
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});

//middleware
app.use(morgan('dev'));
app.use(express.json());
// app.use(cors({credentials: true,}));
app.use(cookieParser());
app.use(cors({
    origin: "*",
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
  }));

app.set('socketio', io); // Set the socket.io instance in the app
//socket.io connection handler
io.on('connection', (socket) => {
    console.log(`⚡Socket connected: ${socket.id}`);
    //gửi đến 1 user
    socket.on('join', (userId) => {
        socket.join(userId); // Join the room with userId
        console.log(`User ${userId} joined the room`);
    });
    //gửi tn chung
    socket.on('sendMessage', (message) => {
        console.log('Message received:', message);
        io.emit('receiveMessage', message); // Broadcast the message to all connected clients
    });

    // Handle disconnection
    socket.on('disconnect', () => {
        console.log('🔥 Socket disconnected:', socket.id);
    });
});

//route
//routes import
import testRoutes from './routes/testRoutes.js';
import userRoutes from "./routes/userRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import loyaltyRoutes from "./routes/loyaltyRoutes.js";
import voucherRoutes from "./routes/voucherRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";

app.use('/api/v1', testRoutes);
app.use('/api/v1/user', userRoutes);
app.use("/api/v1/product", productRoutes);
app.use("/api/v1/category", categoryRoutes);
app.use('/api/v1/order', orderRoutes);
app.use('/api/v1/brand', brandRoutes);
app.use('/api/v1/loyalty', loyaltyRoutes);
app.use('/api/v1/voucher', voucherRoutes);
app.use('/api/v1/favorites', favoriteRoutes);
app.use('/api/v1/notification', notificationRoutes);
app.use('/api/v1/cart', cartRoutes);  
app.use('/api/v1/banner', bannerRoutes);


app.get('/', (req, res) => {
    return res.status(200).send("<h1>API is running</h1>");
});

//port
const PORT = process.env.PORT || 5000;

//listen
server.listen(PORT, () => {
    console.log(`Server is running on port ${process.env.PORT} on ${process.env.NODE_ENV} Mode`.bgMagenta.white);
});