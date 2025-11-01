// Function to generate a token for new user
import jwt from "jsonwebtoken";

export const generateToken = (userId) => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not set in environment variables");
  }
  
  const token = jwt.sign(
    { userId }, 
    process.env.JWT_SECRET,
    { expiresIn: "7d" } // Token expires in 7 days
  );
  
  return token;
};  