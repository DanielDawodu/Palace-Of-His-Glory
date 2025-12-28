import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import session from "express-session";
import MemoryStore from "memorystore";

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
    const user = await storage.getUserByUsername(username);
    
    // Simple password check for lite prototype (should use hashing in prod)
    if (user && user.password === password) {
      (req.session as any).userId = user.id;
      return res.json({ message: "Login successful" });
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
      const event = await storage.createEvent(req.body);
      res.status(201).json(event);
    } catch (e) {
      res.status(400).json({ message: "Invalid input" });
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
    const programme = await storage.createProgramme(req.body);
    res.status(201).json(programme);
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
    const staffMember = await storage.createStaff(req.body);
    res.status(201).json(staffMember);
  });

  // Departments Routes
  app.get(api.departments.list.path, async (req, res) => {
    const departments = await storage.getDepartments();
    res.json(departments);
  });

  app.post(api.departments.create.path, requireAuth, async (req, res) => {
    const department = await storage.createDepartment(req.body);
    res.status(201).json(department);
  });

  // Comments Routes
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

  // Seeding
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingUser = await storage.getUserByUsername("admin");
  if (!existingUser) {
    await storage.createUser({
      username: "admin",
      password: "password123", // Default password
      isAdmin: true
    });
  }

  const existingStaff = await storage.getStaff();
  if (existingStaff.length === 0) {
    await storage.createStaff({
      name: "Rev. Dr. Olusola Areogun",
      role: "Lead Pastor",
      category: "pastor",
      isLead: true,
      bio: "General Overseer of Palace of His Glory International Ministries."
    });
    await storage.createStaff({
      name: "Pastor Mrs. Ojeleye",
      role: "Associate Pastor",
      category: "pastor",
      isLead: false
    });
  }

  const existingProgrammes = await storage.getProgrammes();
  if (existingProgrammes.length === 0) {
    await storage.createProgramme({
      title: "Sunday Service",
      description: "Join us for a time of worship and word.",
      type: "weekly",
      day: "Sunday",
      time: "9:00 AM",
      location: "Main Auditorium"
    });
    await storage.createProgramme({
      title: "Bible Study",
      description: "Digging deep into the scriptures.",
      type: "weekly",
      day: "Wednesday",
      time: "5:00 PM",
      location: "Main Auditorium"
    });
  }

  const existingDepartments = await storage.getDepartments();
  if (existingDepartments.length === 0) {
    await storage.createDepartment({
      name: "Choir Department",
      leader: "Bro. David",
      description: "Leading the congregation in worship."
    });
    await storage.createDepartment({
      name: "Ushers Department",
      leader: "Sis. Mary",
      description: "Maintaining order and welcoming guests."
    });
  }
}
