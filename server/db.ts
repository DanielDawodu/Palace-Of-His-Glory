import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  console.warn(
    "MONGODB_URI not set. server/db.ts will not connect to a real database. We will fallback to MemStorage.",
  );
}

export const connectDB = async () => {
  if (!process.env.MONGODB_URI) return;
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      connectTimeoutMS: 8000,
      socketTimeoutMS: 8000,
      serverSelectionTimeoutMS: 8000,
    });
    console.log("✅ Connected to MongoDB successfully to", mongoose.connection.host);
  } catch (err: any) {
    console.error("❌ MongoDB connection error:", err.message);
  }
};
