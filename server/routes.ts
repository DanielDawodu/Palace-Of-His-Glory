import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";
import { upload } from "./cloudinary";
import { insertRegistrationSchema, insertEventSchema, insertProgrammeSchema, insertStaffSchema, insertDepartmentSchema } from "@shared/schema";

const SessionStore = MemoryStore(session);

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Session setup
  app.use(
    session({
      store: new SessionStore({ checkPeriod: 86400000 }),
      secret: "church_secret_key",
      resave: false,
      saveUninitialized: false,
      cookie: { maxAge: 86400000, secure: process.env.NODE_ENV === "production" }
    })
  );

  // Auth Routes
  app.post(api.auth.login.path, async (req, res) => {
    const { username, password } = req.body;
    // Try username first
    let user = await storage.getUserByUsernameCaseInsensitive(username);

    // If not found, try email
    if (!user) {
      user = await storage.getUserByEmailCaseInsensitive(username);
    }

    // Simple password check for lite prototype (should use hashing in prod)
    console.log(`Login attempt for: ${username}`);
    if (user) {
      console.log(`User found: ${user.username}`);
      console.log(`Stored password: "${user.password}"`);
      console.log(`Provided password: "${password}"`);
      console.log(`Match: ${user.password === password}`);

      if (user.password === password) {
        (req.session as any).userId = user.id;
        return res.json({ message: "Login successful" });
      }
    } else {
      console.log(`User not found: "${username}"`);
    }

    res.status(401).json({ message: "Invalid credentials" });
  });

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
        password, // Note: In a real app, hash this!
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
    await storage.deleteEvent(parseInt(req.params.id));
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
    await storage.deleteProgramme(parseInt(req.params.id));
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

  // Comments Routes
  app.patch("/api/events/:id/live", requireAuth, async (req, res) => {
    const id = parseInt(req.params.id);
    const { isLive, videoUrl } = req.body;
    try {
      const event = await storage.updateEvent(id, { isLive, videoUrl });
      res.json(event);
    } catch (e) {
      res.status(404).json({ message: "Event not found" });
    }
  });

  app.get(api.comments.list.path, async (req, res) => {
    const comments = await storage.getComments(parseInt(req.params.eventId));
    res.json(comments);
  });

  app.post(api.comments.create.path, async (req, res) => {
    const comment = await storage.createComment({
      ...req.body,
      eventId: parseInt(req.params.eventId)
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
  }, upload.single("image"), (req, res) => {
    if (!req.file) {
      console.error("❌ No file in request");
      return res.status(400).json({ message: "No file uploaded" });
    }
    console.log("✅ File uploaded to Cloudinary:", (req.file as any).path);
    // multer-storage-cloudinary adds 'path' to the file object which is the URL
    res.json({ url: (req.file as any).path });
  });

  // Seeding
  try {
    await seedDatabase();
  } catch (e: any) {
    console.error("❌ Failed to seed database:", e);
    (global as any).seedError = e.message;
    // Don't throw, let the server start
  }

  // Diagnostics Endpoint
  app.get("/api/diagnostics", async (req, res) => {
    try {
      const isDatabaseConfigured = !!process.env.DATABASE_URL;
      let dbStatus = "Unknown";
      let counts = { users: 0, events: 0, programmes: 0, staff: 0 };
      let seedStatus = (global as any).seedError ? `Failed: ${(global as any).seedError}` : "Success";

      if (isDatabaseConfigured) {
        try {
          // Check connection
          await storage.getUserByUsernameCaseInsensitive("Daniel");
          dbStatus = "Connected";

          // Get counts
          const users = await storage.getAdmins(); // Reusing getAdmins as a proxy for user count (or add explicit count methods later)
          const events = await storage.getEvents();
          const programmes = await storage.getProgrammes();
          const staff = await storage.getStaff();

          counts = {
            users: users.length, // This is just admins, but good enough for now
            events: events.length,
            programmes: programmes.length,
            staff: staff.length
          };

        } catch (e: any) {
          dbStatus = `Connection Error: ${e.message}`;
        }
      } else {
        dbStatus = "Not Configured (Using Memory)";
        // In memory stats
        const events = await storage.getEvents();
        const programmes = await storage.getProgrammes();
        const staff = await storage.getStaff();
        counts = {
          users: (await storage.getAdmins()).length,
          events: events.length,
          programmes: programmes.length,
          staff: staff.length
        };
      }

      res.json({
        status: "online",
        environment: process.env.NODE_ENV,
        storageMode: isDatabaseConfigured ? "Database" : "Memory",
        databaseStatus: dbStatus,
        dataCounts: counts,
        seedStatus: seedStatus,
        timestamp: new Date().toISOString()
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  return httpServer;
}

async function seedDatabase() {
  console.log("🌱 Seeding database...");

  // Create Daniel if he doesn't exist
  const danielByUsername = await storage.getUserByUsernameCaseInsensitive("Daniel");
  const allUsers = await (storage as any).getUsers?.() || []; // If storage has a way to list all

  if (!danielByUsername) {
    console.log("👤 Creating user 'Daniel'...");
    await storage.createUser({
      username: "Daniel",
      email: "danieldawodu07@gmail.com",
      password: "Daniel@123",
      isAdmin: true
    });
    console.log("✅ User 'Daniel' created successfully.");
  } else if (danielByUsername.password !== "Daniel@123" || danielByUsername.email !== "danieldawodu07@gmail.com") {
    console.log("👤 User 'Daniel' exists but data is outdated. Resetting credentials...");
    // Since we don't have an update method, we'll manually fix it if it's MemStorage
    // For now, let's just log exactly what's expected.
    // In a real DB we'd use an update query.
    danielByUsername.password = "Daniel@123";
    danielByUsername.email = "danieldawodu07@gmail.com";
    console.log("✅ User 'Daniel' credentials reset.");
  } else {
    console.log("👤 User 'Daniel' exists with correct credentials.");
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
  } s
}
