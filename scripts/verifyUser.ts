import { storage } from "../server/storage";

async function verify() {
    console.log("Checking for user 'Daniel'...");
    const user = await storage.getUserByUsername("Daniel");
    if (user) {
        console.log("✅ User 'Daniel' found in storage!");
        console.log("Username:", user.username);
        console.log("Email:", (user as any).email);
        console.log("Is Admin:", user.isAdmin);
        process.exit(0);
    } else {
        console.log("❌ User 'Daniel' NOT found in storage.");
        process.exit(1);
    }
}

verify();
