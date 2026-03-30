import mongoose from 'mongoose';
import 'dotenv/config';
import { UserModel, EventModel, ProgrammeModel, StaffModel, DepartmentModel, CommentModel, RegistrationModel } from '../server/models';

async function resetDB() {
    if (!process.env.MONGODB_URI) {
        console.error("❌ MONGODB_URI not found in environment variables.");
        process.exit(1);
    }

    try {
        console.log("📂 Connecting to MongoDB...");
        await mongoose.connect(process.env.MONGODB_URI);
        console.log("✅ Connected.");

        console.log("🧹 Clearing collections...");
        await Promise.all([
            UserModel.deleteMany({}),
            EventModel.deleteMany({}),
            ProgrammeModel.deleteMany({}),
            StaffModel.deleteMany({}),
            DepartmentModel.deleteMany({}),
            CommentModel.deleteMany({}),
            RegistrationModel.deleteMany({}),
        ]);
        console.log("✅ All collections cleared successfully.");

        console.log("\n🌱 The next time you visit the site (or restart the server), it will re-seed fresh data.");
        process.exit(0);
    } catch (err: any) {
        console.error("❌ Error resetting database:", err.message);
        process.exit(1);
    }
}

resetDB();
