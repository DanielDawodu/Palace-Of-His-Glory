import mongoose from "mongoose";

if (!process.env.MONGODB_URI) {
  console.warn(
    "MONGODB_URI not set. server/db.ts will not connect to a real database. We will fallback to MemStorage.",
  );
}

// Tracks whether we have ever achieved a real, live connection to MongoDB.
// This is the source of truth the storage layer uses to decide whether it's
// safe to use MongoStorage - NOT just whether MONGODB_URI happens to be set.
export let isDbConnected = false;

mongoose.connection.on("connected", () => {
  isDbConnected = true;
  console.log("✅ Mongoose connection state: connected");
});
mongoose.connection.on("disconnected", () => {
  isDbConnected = false;
  console.warn("⚠️ Mongoose connection state: disconnected");
});
mongoose.connection.on("error", (err) => {
  isDbConnected = false;
  console.error("❌ Mongoose connection error:", err.message);
});

let connectPromise: Promise<void> | null = null;

export const connectDB = async (): Promise<void> => {
  if (!process.env.MONGODB_URI) return;
  if (isDbConnected) return;
  // Avoid firing multiple concurrent connection attempts (common in serverless
  // where several requests can hit a cold start at once).
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      await mongoose.connect(process.env.MONGODB_URI as string, {
        connectTimeoutMS: 8000,
        socketTimeoutMS: 8000,
        serverSelectionTimeoutMS: 8000,
      });
      isDbConnected = true;
      console.log("✅ Connected to MongoDB successfully to", mongoose.connection.host);
    } catch (err: any) {
      isDbConnected = false;
      console.error("❌ MongoDB connection error:", err.message);
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
};
