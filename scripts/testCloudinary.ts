import "dotenv/config";
import { cloudinary } from "../server/cloudinary";

async function testCloudinary() {
    console.log("Testing Cloudinary connection...");
    try {
        const result = await cloudinary.api.ping();
        console.log("Cloudinary connection successful:", result);
    } catch (error) {
        console.error("Cloudinary connection failed:", error);
        process.exit(1);
    }
}

testCloudinary();
