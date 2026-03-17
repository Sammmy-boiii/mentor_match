import express from 'express';
import "dotenv/config";
import cors from 'cors';
import { createServer } from 'http';
import connectDB from './config/mongodb.js';
import adminRouter from './routes/adminRoute.js';
import { v2 as cloudinary } from "cloudinary"
import connectCloudinary from "./config/cloudinary.js";
import tutorRouter from './routes/tutorRoute.js';
import userRouter from './routes/userRoute.js';
import videoCallRouter from './routes/videoCallRoute.js';
import marketplaceRouter from './routes/marketplaceRoute.js';
import setupSocketIO from './config/socketio.js';


const app = express();
const server = createServer(app);
const port = process.env.PORT || 4000;

// Establish connections and start server
async function startServer() {
    try {
        await connectDB(); // Establish connection to database
        connectCloudinary(); // Setup Cloudinary for Image Storage

        // Setup Socket.IO for WebRTC signaling
        const io = setupSocketIO(server);
        app.set('socketio', io);

        //Middleware Setup
        app.use(express.json())//Enables JSON request body parsing
        app.use(cors())//Enables CORS origin requests

        //Define API Routes
        app.use('/api/admin', adminRouter)
        app.use('/api/tutor', tutorRouter)
        app.use('/api/user', userRouter)
        app.use('/api/video-call', videoCallRouter)
        app.use('/api/marketplace', marketplaceRouter)

        //Route Endpoint to check api status`
        app.get('/', (req, res) => {
            res.send('API successfully connectedddd');
        });

        // Start the server
        server.listen(port, () =>
            console.log(`Server is running on port ${port}`)
        );
    } catch (error) {
        console.error("Failed to start server:", error.message);
        process.exit(1);
    }
}

startServer();
