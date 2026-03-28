// scripts/createAdmin.ts
console.log("🚀 Admin Creation Script");

// Use ES6 import
import * as storage from "../server/storage";
import { connectDB } from "../server/db";

async function main() {
    await connectDB();
    const args = process.argv.slice(2);
    const email = args[0];
    const password = args[1];
    const username = args[0].split('@')[0]; // Simple username from email

    if (!email || !password) {
        console.error("❌ Usage: npm run create-admin -- <email> <password>");
        console.error("Example: npm run create-admin -- danieldawodu07@gmail.com Daniel@123");
        process.exit(1);
    }

    console.log(`📧 Creating admin: ${email}`);

    try {
        // Check if user already exists
        const existingUser = await storage.storage.getUserByUsername(username);
        if (existingUser) {
            console.log(`User ${username} already exists. Updating to admin...`);
            // Ideally we'd have an updateUser method, but for now we might just report it
            if (existingUser.isAdmin) {
                console.log("✅ User is already an admin.");
                process.exit(0);
            } else {
                console.log("⚠️ User exists but is not an admin. Please update manually (updateUser not fully exposed in script yet).");
                process.exit(1);
            }
        }

        const newUser = await storage.storage.createUser({
            username,
            email,
            password, // In a real app, hash this!
            isAdmin: true
        });

        console.log("\n" + "=".repeat(50));
        console.log("✅ ADMIN CREATED SUCCESSFULLY!");
        console.log("=".repeat(50));
        console.log(`📧 Email: ${newUser.email}`);
        console.log(`🆔 ID: ${newUser.id}`);
        console.log(`👑 Role: Admin`);
        console.log("=".repeat(50));
        
        process.exit(0);

    } catch (error: any) {
        console.error("❌ Error:", error.message);
        if (error.stack) {
            console.error("Stack:", error.stack.split('\n')[0]);
        }
    }
}

main();