import express from "express";
import "dotenv/config";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { connectDB } from "./Lib/db.js";
import userRouter from "./Routes/UserRoute.js";
import messageRouter from "./Routes/MessageRoutes.js";


// creae express app and http server
const app = express();
const server = http.createServer(app);

// Initialize Socket.io server
export const io = new Server(server, {
  cors: {  
    origin: process.env.NODE_ENV === "production" 
      ? [process.env.CLIENT_URL || "https://your-client-vercel-url.vercel.app"] 
      : ["http://localhost:5173", "http://localhost:3000"],
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ["websocket", "polling"],
  allowEIO3: true
});
// Expose io and userSocketMap via app locals to avoid circular imports
app.set("io", io);
const userSocketMap = {};
app.set("userSocketMap", userSocketMap);

//store online users
//store online users in userSocketMap

//Socket.io connection handler
io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    console.log("User connected:", userId, "Socket ID:", socket.id);   
    
    if (userId) {
        userSocketMap[userId] = socket.id;
        console.log("User added to map:", userId, "Total online users:", Object.keys(userSocketMap).length);
    }

    //Emit online users to all connected clients
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", (reason) => {
        console.log("User disconnected:", userId, "Reason:", reason);   
        if (userId) {
            delete userSocketMap[userId];
            console.log("User removed from map:", userId, "Remaining online users:", Object.keys(userSocketMap).length);
            //Emit updated online users list
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        }
    });

    socket.on("error", (error) => {
        console.log("Socket error for user:", userId, "Error:", error);
    });
});



// Middleware Setup
app.use(express.json({ limit: "10mb" }));
app.use(cors());

//Routes setup
app.use("/api/status", (req, res) => {
  res.send("Server is running");
});
app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);
//contect to mongodb
await connectDB();



if(process.env.NODE_ENV === "production") {
 
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

//export server for vercel
export default app;

