import express from "express";
import "dotenv/config";
import { Server } from "socket.io";
import http from "http";
import cors from "cors";
import { connectDB } from "./Lib/db.js";
import userRouter from "./Routes/UserRoute.js";
import messageRouter from "./Routes/MessageRoutes.js";

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:3000",
  "https://chat-app-hxcj.vercel.app"  // ✅ your Vercel frontend
];

// Initialize Socket.io server
export const io = new Server(server, {
  cors: {  
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST"]
  },
  transports: ["polling", "websocket"],
  allowEIO3: true,
  pingTimeout: 60000,
  pingInterval: 25000
});

// Expose io and userSocketMap via app locals to avoid circular imports
app.set("io", io);
const userSocketMap = {};
app.set("userSocketMap", userSocketMap);

// Socket.io connection handler
io.on("connection", (socket) => {
  const userId = socket.handshake.query.userId;
  
  if (userId) {
    userSocketMap[userId] = socket.id;
  }

  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    if (userId) {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    }
  });

  socket.on("error", (error) => {
    console.error("Socket error for user:", userId, "Error:", error);
  });
});

// Middleware Setup
app.use(express.json({ limit: "10mb" }));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "token"]
}));

// Routes setup
app.get("/", (req, res) => {
  res.json({ message: "Chat App Server is running!", status: "OK" });
});

app.get("/api/status", (req, res) => {
  res.json({ message: "Server is running", status: "OK" });
});

app.use("/api/auth", userRouter);
app.use("/api/messages", messageRouter);

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env.PORT || 5000;
    server.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
export default app;
