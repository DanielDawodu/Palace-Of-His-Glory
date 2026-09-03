import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage, verifyPassword, isBcryptHash } from "./storage.js";
import { api } from "../shared/routes.js";
import { z } from "zod";
import session from "express-session";
import MemoryStoreFactory from "memorystore";
import MongoStore from "connect-mongo";
import { upload } from "./cloudinary.js";
import { connectDB, isDbConnected } from "./db.js";
import { insertRegistrationSchema, insertEventSchema, insertProgrammeSchema, insertStaffSchema, insertDepartmentSchema } from "../shared/schema.js";

const MemoryStore = MemoryStoreFactory(session);

// SESSION_SECRET should always be set via an environment variable in
// production. We fall back to a generated value so local/dev never crashes,
// but warn loudly so it doesn't go unnoticed on a real deployment.
const SESSION_SECRET = process.env.SESSION_SECRET || (() => {
  console.warn("⚠️ SESSION_SECRET not set in environment - using an insecure default. Set SESSION_SECRET in Vercel env vars before going live.");
  return "insecure-dev-secret-change-me";
})();

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // --- CRITICAL INITIALIZATION (Must happen first for Auth) ---
  console.log("📂 Connecting to database...");
  await connectDB();

  // Build the session store defensively: a malformed MONGODB_URI (e.g. a
  // rotated password with unescaped special characters like @ # % /) can
  // throw synchronously inside MongoStore.create(). If that isn't caught,
  // the ENTIRE serverless function fails to initialize and every route
  // 404s - not just the ones that touch the database. Falling back to
  // MemoryStore here keeps the site (and login) working even if the Mongo
  // connection string is broken.
  let sessionStore: session.Store;
  if (process.env.MONGODB_URI) {
    try {
      sessionStore = MongoStore.create({ mongoUrl: process.env.MONGODB_URI });
    } catch (err: any) {
      console.error("❌ Failed to initialize MongoStore session store - falling back to MemoryStore. This usually means MONGODB_URI is malformed (check for unescaped special characters in the password, e.g. @ # % / should be percent-encoded). Error:", err.message);
      sessionStore = new MemoryStore({ checkPeriod: 86400000 });
    }
  } else {
    sessionStore = new MemoryStore({ checkPeriod: 86400000 });
  }

  app.use(
    session({
      store: sessionStore,
      name: "palace_sid",
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      proxy: true,
      cookie: { maxAge: 86400000, secure: process.env.NODE_ENV === "production", sameSite: "lax" }
    })
  );
  console.log("✅ Session middleware attached.");

  // --- CRITICAL VERCEL ROUTING ---
  // Use regex to match paths regardless of /api prefix or stripping
  app.get(/.*diagnostics$/, async (req, res) => {
    try {
      const isDatabaseConfigured = !!process.env.MONGODB_URI;
      let seedStatus = "Checking...";

      try {
        let admins = await storage.getAdmins();
        if (admins.length === 0) {
          seedStatus = "Triggering Seed...";
          await seedDatabase().catch(e => seedStatus = `Seed Failed: ${e.message}`);
          admins = await storage.getAdmins();
          seedStatus = seedStatus === "Triggering Seed..." ? "Seed Successful" : seedStatus;
        } else {
          seedStatus = "Already Seeded";
        }
      } catch (e: any) {
        seedStatus = `Error: ${e.message}`;
      }

      const events = await storage.getEvents();
      const programmes = await storage.getProgrammes();
      const staff = await storage.getStaff();
      const admins = await storage.getAdmins();

      res.json({
        status: "online",
        // configured: MONGODB_URI is present in env vars
        // connected: mongoose actually has a live connection right now
        // storageMode: which storage is ACTUALLY serving requests at this moment
        database: {
          configured: isDatabaseConfigured,
          connected: isDbConnected,
          storageMode: isDbConnected ? "MongoDB" : "In-Memory (fallback)",
        },
        counts: {
          users: admins.length,
          events: events.length,
          programmes: programmes.length,
          staff: staff.length
        },
        seed: seedStatus,
        env: process.env.NODE_ENV,
        node: process.version,
        path: req.path
      });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post(/.*login$/, async (req, res) => {
    try {
      console.log(`🔑 Login attempt for: ${req.body?.username}`);
      const { username, password } = req.body;
      let user = await storage.getUserByUsernameCaseInsensitive(username || "");
      if (!user) user = await storage.getUserByEmailCaseInsensitive(username || "");

      const passwordOk = user ? await verifyPassword(password || "", user.password) : false;

      if (!user || !passwordOk) {
        console.warn(`❌ Login failure: Invalid credentials for ${username}`);
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Transparently upgrade any legacy plaintext password to a bcrypt hash
      // now that we know it was correct.
      if (!isBcryptHash(user.password)) {
        await storage.updateUserPassword(user.id, password);
      }

      if (!req.session) {
        console.error("❌ Session middleware failed to initialize!");
        return res.status(500).json({ error: "Session initialization failed" });
      }

      (req.session as any).userId = user.id;
      (req.session as any).username = user.username;
      
      console.log(`✅ Login success: ${user.username} (ID: ${user.id})`);
      const { password: _pw, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (err: any) {
      console.error(`❌ Login Error: ${err.message}`);
      res.status(500).json({ error: err.message });
    }
  });
  // --- END CRITICAL VERCEL ROUTING ---

  app.post(api.auth.logout.path, (req, res) => {
    req.session.destroy(() => {
      res.json({ message: "Logged out" });
    });
  });

  app.get(api.auth.user.path, async (req, res) => {
    if (!(req.session as any).userId) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    const user = await storage.getUser((req.session as any).userId);
    if (!user) return res.status(401).json({ message: "User not found" });
    const { password, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  });

  // Middleware to check auth
  const requireAuth = (req: any, res: any, next: any) => {
    if (!req.session.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    next();
  };

  // Events Routes
  app.get(api.events.list.path, async (req, res) => {
    const events = await storage.getEvents();
    res.json(events);
  });

  app.post(api.events.create.path, requireAuth, async (req, res) => {
    try {
      const data = { ...req.body };

      // Fix: Handle empty strings for optional URL fields
      if (data.imageUrl === "") data.imageUrl = null;
      if (data.videoUrl === "") data.videoUrl = null;

      // Fix: robust date parsing
      if (typeof data.date === "string") {
        data.date = new Date(data.date);
      }

      if (isNaN(data.date?.getTime())) {
        return res.status(400).json({ message: "Invalid date format" });
      }

      const validatedData = insertEventSchema.parse(data);
      const event = await storage.createEvent(validatedData);
      res.status(201).json(event);
    } catch (e: any) {
      console.error("❌ Event creation error:", e);
      res.status(400).json({
        message: "Invalid input",
        details: e.errors ? e.errors : e.message
      });
    }
  });

  // Create Admin Route
  app.post("/api/admin/create", requireAuth, async (req, res) => {
    try {
      const { username, password, email } = req.body;
      if (!username || !password || !email) {
        return res.status(400).json({ message: "Username, email and password are required" });
      }

      const existingUser = await storage.getUserByUsernameCaseInsensitive(username);
      if (existingUser) {
        return res.status(409).json({ message: "Username already exists" });
      }

      const newUser = await storage.createUser({
        username,
        password, // storage.createUser hashes this before persisting
        email,
        isAdmin: true
      });

      res.status(201).json({ message: "Admin created successfully", user: { id: newUser.id, username: newUser.username } });
    } catch (e: any) {
      console.error("❌ Admin creation error:", e);
      res.status(500).json({ message: "Failed to create admin" });
    }
  });

  app.get("/api/admins", requireAuth, async (req, res) => {
    try {
      const admins = await storage.getAdmins();
      // Don't send passwords
      const safeAdmins = admins.map(a => {
        const { password, ...rest } = a;
        return rest;
      });
      res.json(safeAdmins);
    } catch (e: any) {
      res.status(500).json({ message: "Failed to fetch admins" });
    }
  });

  app.delete(api.events.delete.path, requireAuth, async (req, res) => {
    await storage.deleteEvent(req.params.id);
    res.status(204).send();
  });

  // Programmes Routes
  app.get(api.programmes.list.path, async (req, res) => {
    const programmes = await storage.getProgrammes();
    res.json(programmes);
  });

  app.post(api.programmes.create.path, requireAuth, async (req, res) => {
    try {
      const validatedData = insertProgrammeSchema.parse(req.body);
      const programme = await storage.createProgramme(validatedData);
      res.status(201).json(programme);
    } catch (e: any) {
      res.status(400).json({ message: "Invalid input", details: e.errors || e.message });
    }
  });

  app.delete(api.programmes.delete.path, requireAuth, async (req, res) => {
    await storage.deleteProgramme(req.params.id);
    res.status(204).send();
  });

  // Staff Routes
  app.get(api.staff.list.path, async (req, res) => {
    const staff = await storage.getStaff();
    res.json(staff);
  });

  app.post(api.staff.create.path, requireAuth, async (req, res) => {
    try {
      const validatedData = insertStaffSchema.parse(req.body);
      const staffMember = await storage.createStaff(validatedData);
      res.status(201).json(staffMember);
    } catch (e: any) {
      res.status(400).json({ message: "Invalid input", details: e.errors || e.message });
    }
  });

  app.delete(api.staff.delete.path, requireAuth, async (req, res) => {
    await storage.deleteStaff(req.params.id);
    res.status(204).send();
  });

  // Departments Routes
  app.get(api.departments.list.path, async (req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  app.post(api.departments.create.path, requireAuth, async (req, res) => {
    try {
      const validatedData = insertDepartmentSchema.parse(req.body);
      const department = await storage.createDepartment(validatedData);
      res.status(201).json(department);
    } catch (e: any) {
      res.status(400).json({ message: "Invalid input", details: e.errors || e.message });
    }
  });

  app.delete(api.departments.delete.path, requireAuth, async (req, res) => {
    await storage.deleteDepartment(req.params.id);
    res.status(204).send();
  });

  // Comments Routes
  app.patch("/api/events/:id/live", requireAuth, async (req, res) => {
    const id = req.params.id;
    const { isLive, videoUrl } = req.body;
    try {
      const event = await storage.updateEvent(id, { isLive, videoUrl });
      res.json(event);
    } catch (e) {
      res.status(404).json({ message: "Event not found" });
    }
  });

  app.get(api.comments.list.path, async (req, res) => {
    const comments = await storage.getComments(req.params.eventId);
    res.json(comments);
  });

  app.post(api.comments.create.path, async (req, res) => {
    const comment = await storage.createComment({
      ...req.body,
      eventId: req.params.eventId
    });
    res.status(201).json(comment);
  });
  // Registrations Routes
  app.get(api.registrations.list.path, requireAuth, async (req, res) => {
    const regs = await storage.getRegistrations();
    res.json(regs);
  });

  app.post(api.registrations.create.path, async (req, res) => {
    try {
      console.log("📝 Received registration submission:", JSON.stringify(req.body));
      const validatedData = insertRegistrationSchema.parse(req.body);
      const reg = await storage.createRegistration(validatedData);
      console.log("✅ Registration created:", reg.id);
      res.status(201).json(reg);
    } catch (e: any) {
      console.error("❌ Registration error:", e.message || e);
      if (e.errors) {
        console.error("Validation details:", JSON.stringify(e.errors));
      }
      res.status(400).json({ message: "Invalid input", details: e.message });
    }
  });


  // Image Upload Route
  app.post("/api/upload", requireAuth, (req, res, next) => {
    console.log("📸 Upload request received");
    console.log("User authenticated:", (req.session as any).userId);
    next();
  }, (req, res, next) => {
    upload.single("image")(req, res, (err: any) => {
      if (err) {
        const httpCode = err.http_code || err.status || err.statusCode || 500;
        console.error(`❌ Cloudinary upload error (${httpCode}):`, err.message);
        let message = err.message || "Upload failed";
        if (httpCode === 403) {
          message = "Cloudinary rejected the upload (403). This usually means 'Strict Transformations' is enabled on the account, an upload preset restriction, or a credential mismatch. Check Cloudinary Settings -> Security.";
        }
        return res.status(httpCode >= 400 && httpCode < 600 ? httpCode : 500).json({ message });
      }
      next();
    });
  }, (req, res) => {
    if (!req.file) {
      console.error("❌ No file in request");
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("✅ File uploaded to Cloudinary:", (req.file as any).path);
    // multer-storage-cloudinary adds 'path' to the file object which is the URL
    res.json({ url: (req.file as any).path });
  });

  // Start seeding in background so it doesn't block server startup
  seedDatabase().catch(err => {
    console.error("❌ Critical: Database seeding failed:", err);
  });


  // Catch-all for API that didn't match anything - helpful for debugging
  app.use("/api/*", (req, res) => {
    console.log(`⚠️ Unmatched API Request: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: `API route not found: ${req.originalUrl}` });
  });

  console.log("🚀 All routes registered successfully.");
  return httpServer;
}

// Default admin account, seeded only if it doesn't already exist. Set these
// via environment variables in Vercel; the values below are local-dev-only
// fallbacks and should never be relied on in production.
const SEED_ADMIN_USERNAME = process.env.ADMIN_USERNAME || "Daniel";
const SEED_ADMIN_EMAIL = process.env.ADMIN_EMAIL || "danieldawodu07@gmail.com";
const SEED_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "Daniel@123";

if (!process.env.ADMIN_PASSWORD) {
  console.warn("⚠️ ADMIN_PASSWORD not set in environment - using an insecure default admin password. Set ADMIN_USERNAME/ADMIN_EMAIL/ADMIN_PASSWORD in Vercel env vars before your event.");
}

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create the default admin if they don't exist yet
  const existingAdmin = await storage.getUserByUsernameCaseInsensitive(SEED_ADMIN_USERNAME);

  if (!existingAdmin) {
    console.log(`👤 Creating user '${SEED_ADMIN_USERNAME}'...`);
    await storage.createUser({
      username: SEED_ADMIN_USERNAME,
      email: SEED_ADMIN_EMAIL,
      password: SEED_ADMIN_PASSWORD,
      isAdmin: true
    });
    console.log(`✅ User '${SEED_ADMIN_USERNAME}' created successfully.`);
  } else {
    console.log(`👤 User '${SEED_ADMIN_USERNAME}' already exists - leaving credentials as-is.`);
  }

  const existingStaff = await storage.getStaff();
  if (existingStaff.length === 0) {
    await storage.createStaff({
      name: "Pastor Bright Oluwole",
      role: "Lead Pastor and General Overseer",
      category: "pastor",
      isLead: true,
      bio: "Pastor Bright Oluwole is the visionary leader and General Overseer of Palace of His Glory International Ministries. A charismatic and dynamic preacher, he is known for his honest and transparent approach to ministry. With a heart ablaze for God and a passion for souls, he has dedicated his life to teaching the undiluted Word of God with clarity and power. His ministry is marked by a strong emphasis on prayer, worship, and raising believers to walk in their God-given purpose and destiny. Pastor Bright's authentic leadership style and commitment to truth have made him a trusted spiritual guide to many.",
      imageUrl: "/pastor-bright.jpg"
    });
    await storage.createStaff({
      name: "Pastor Oluwakemi Adesanya",
      role: "Associate Pastor",
      category: "pastor",
      isLead: false,
      imageUrl: "/pastor-oluwakemi.jpg"
    });
    await storage.createStaff({
      name: "Pastor  Adewale Olusanwo",
      role: "Associate Pastor",
      category: "pastor",
      isLead: false,
      imageUrl: "/pastor-adewale.jpg"
    });
  }

  const existingProgrammes = await storage.getProgrammes();
  const defaultProgrammes = [
    {
      title: "Sunday School",
      description: "Join us for a time of worship and word.",
      type: "weekly",
      day: "Sunday",
      time: "8:00 AM",
      location: "Main Auditorium"
    },
    {
      title: "Sunday Service",
      description: "Join us for a time of worship and word.",
      type: "weekly",
      day: "Sunday",
      time: "9:00 AM",
      location: "Main Auditorium"
    },
    {
      title: "Bible Study",
      description: "Digging deep into the scriptures.",
      type: "weekly",
      day: "Tuesday",
      time: "5:30 PM",
      location: "Main Auditorium"
    },
    {
      title: "Hour Of Glorification",
      description: "Revival Sessions.",
      type: "weekly",
      day: "Wednesday",
      time: "5:00 PM",
      location: "Main Auditorium"
    },
    // Special Programmes from User
    {
      title: "Night of Destiny",
      description: "A powerful night of prophetic prayers and divine encounters.",
      type: "special",
      day: "Every last Friday of the Month",
      time: "11:00 PM",
      location: "Main Sanctuary"
    },
    {
      title: "Romilowo",
      description: "Every 2nd Saturday of the Month Prayer and sacrifice.",
      type: "special",
      day: "Every 2nd Saturday of the Month",
      time: "5:30 AM - 7:00 AM",
      location: "Main Sanctuary"
    },
    {
      title: "Youth Summit",
      description: "Empowering the next generation for kingdom impact.",
      type: "special",
      day: "Every 1st Tuesday of the Month",
      time: "5:30 PM",
      location: "Youth Hall"
    },
    {
      title: "Hosannah Service",
      description: "A special service of praise and victory.",
      type: "special",
      day: "Every 1st Sunday of the Month",
      time: "9:00 AM",
      location: "Main Sanctuary"
    },
    {
      title: "Impartation Service",
      description: "Divine empowerment and mantle for the week ahead.",
      type: "special",
      day: "Every last Sunday of the Month",
      time: "7:30 AM",
      location: "Main Sanctuary"
    }
  ];

  for (const p of defaultProgrammes) {
    if (!existingProgrammes.find(ep => ep.title === p.title)) {
      await storage.createProgramme(p);
    }
  }

  const existingDepartments = await storage.getDepartments();
  if (existingDepartments.length === 0) {
    await storage.createDepartment({
      name: "Choir Department",
      leader: "Sis. Adebisi",
      description: "Leading the congregation in worship.",
    });
    await storage.createDepartment({
      name: "Ushers Department",
      leader: "Sis. Adebanjo",
      description: "Maintaining order and welcoming guests."
    });
  }
}
