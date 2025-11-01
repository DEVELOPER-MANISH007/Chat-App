import mongoose from "mongoose";

// Function to connect to the mongodb database
export const connectDB = async () => {
  try {
    // Set up connection event listeners
    mongoose.connection.on("error", (err) => {
      console.error("Database Connection Error:", err);
    });

    // Connect to MongoDB
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(`${mongoUri}/chat-app`, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (error) {
    console.error("Database Connection Failed:", error.message);
    throw error; // Re-throw to let caller handle it
  }
};
