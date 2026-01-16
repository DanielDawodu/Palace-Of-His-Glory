import "dotenv/config";
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Configure Cloudinary with logging
console.log("☁️ Initializing Cloudinary...");
console.log("CWD:", process.cwd());
console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
const key = process.env.CLOUDINARY_API_KEY;
console.log("API Key loaded:", key ? `${key.substring(0, 4)}... (length: ${key.length})` : "MISSING");
console.log("Has API Secret:", !!process.env.CLOUDINARY_API_SECRET);

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const hasCloudinary = process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET;

let storage;
if (hasCloudinary) {
    // Setup Multer Storage for Cloudinary
    storage = new CloudinaryStorage({
        cloudinary: cloudinary,
        params: async (_req, _file) => {
            return {
                folder: 'church-assets',
                allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
                transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
            };
        },
    });
} else {
    console.warn("⚠️ Cloudinary not configured. Uploads will fail.");
}

export const upload = hasCloudinary ? multer({ storage: storage }) : multer({
    storage: multer.memoryStorage(),
    fileFilter: (_req, _file, cb) => {
        cb(new Error("Cloudinary not configured - Uploads disabled"));
    }
});
export { cloudinary };
