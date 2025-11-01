// Middleware to protect routes
import jwt from "jsonwebtoken";
import User from "../Models/User.js";

export const protectRoute = async (req, res, next) => {
  try {
    const token = req.headers.token;
    if (!token) {
      return res.status(401).json({ success: false, message: "No token provided" });
    }
    
    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not set in environment variables");
      return res.status(500).json({ success: false, message: "Server configuration error" });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select("-password");
    
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    
    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error.message);
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ success: false, message: "Token expired" });
    }
    
    res.status(500).json({ success: false, message: error.message });
  }
};