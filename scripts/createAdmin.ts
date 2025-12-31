// scripts/createAdmin.ts
console.log("🚀 Admin Creation Script");

// Use CommonJS require instead of ES6 import
const storage = require("../server/storage");

async function main() {
    const args = process.argv.slice(2);
    const email = args[0];
    const password = args[1];

    if (!email || !password) {
        console.error("❌ Usage: npm run create-admin -- <email> <password>");
        console.error("Example: npm run create-admin -- danieldawodu07@gmail.com Daniel@123");
        process.exit(1);
    }

    console.log(`📧 Creating admin: ${email}`);

    try {
        // Check if functions exist
        if (!storage.getAdmins || !storage.saveAdmins) {
            console.error("❌ Storage module doesn't have getAdmins or saveAdmins functions");
            console.log("Available exports:", Object.keys(storage));
            process.exit(1);
        }

        // Get existing admins
        const admins = storage.getAdmins();
        console.log(`📊 Found ${admins.length} existing admin(s)`);

        // Check if admin already exists
        const existingAdmin = admins.find((a: any) => a.email === email);
        if (existingAdmin) {
            console.error(`❌ Admin with email "${email}" already exists!`);
            console.log(`   ID: ${existingAdmin.id}`);
            console.log(`   Created: ${existingAdmin.createdAt}`);
            process.exit(1);
        }

        // Create new admin (without bcrypt for now)
        const newAdmin = {
            id: Date.now(),
            email,
            password: password, // Plain text for now - we'll fix this later
            role: "admin" as const,
            createdAt: new Date().toISOString()
        };

        // Add to admins array
        admins.push(newAdmin);

        // Save to file
        storage.saveAdmins(admins);

        console.log("\n" + "=".repeat(50));
        console.log("✅ ADMIN CREATED SUCCESSFULLY!");
        console.log("=".repeat(50));
        console.log(`📧 Email: ${newAdmin.email}`);
        console.log(`🆔 ID: ${newAdmin.id}`);
        console.log(`👑 Role: ${newAdmin.role}`);
        console.log(`📅 Created: ${newAdmin.createdAt}`);
        console.log("=".repeat(50));
        console.log(`\n⚠️  WARNING: Password stored in plain text!`);
        console.log(`   Install bcryptjs: npm install bcryptjs`);
        console.log(`\n📋 Total admins: ${admins.length}`);

    } catch (error: any) {
        console.error("❌ Error:", error.message);
        if (error.stack) {
            console.error("Stack:", error.stack.split('\n')[0]);
        }
    }
}

main();