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
  cors: {  origin: "*"}
});
// Expose io and userSocketMap via app locals to avoid circular imports
app.set("io", io);
const userSocketMap = {};
app.set("userSocketMap", userSocketMap);

//store online users
//store online users in userSocketMap

//Socket.io conncetion handler
io.on("connection", (socket) => {
    
    const userId = socket.handshake.query.userId;
    console.log("userConnected", userId);   
   if  (userId) userSocketMap[userId] = socket.id;

   //Emit online users to all connected clients
   io.emit("getOnlineUsers", Object.keys(userSocketMap));

   socket.on("disconnect", () => {
    console.log("userDisconnected", userId);   
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
   })
})



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

