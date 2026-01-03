import {
  users, events, programmes, staff, departments, comments, registrations,
  type User, type InsertUser,
  type Event, type InsertEvent,
  type Programme, type InsertProgramme,
  type Staff, type InsertStaff,
  type Department, type InsertDepartment,
  type Comment, type InsertComment,
  type Registration, type InsertRegistration
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByUsernameCaseInsensitive(username: string): Promise<User | undefined>;
  getUserByEmailCaseInsensitive(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent> | { isLive: boolean, videoUrl?: string }): Promise<Event>;
  deleteEvent(id: number): Promise<void>;

  // Programmes
  getProgrammes(): Promise<Programme[]>;
  createProgramme(programme: InsertProgramme): Promise<Programme>;
  deleteProgramme(id: number): Promise<void>;

  // Staff
  getStaff(): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;

  // Departments
  getDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Comments
  getComments(eventId: number): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Registrations
  getRegistrations(): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByUsernameCaseInsensitive(username: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    // For simplicity, we filter in memory or use a lower() helper if needed.
    // Drizzle doesn't have a built-in lower() for equality in a generic way without sql-template.
    const allUsers = await db.select().from(users);
    return allUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
  }

  async getUserByEmailCaseInsensitive(email: string): Promise<User | undefined> {
    if (!db) throw new Error("Database not initialized");
    const allUsers = await db.select().from(users);
    return allUsers.find(u => u.email?.toLowerCase() === email.toLowerCase());
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    if (!db) throw new Error("Database not initialized");
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(events);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    if (!db) throw new Error("Database not initialized");
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    if (!db) throw new Error("Database not initialized");
    await db.delete(events).where(eq(events.id, id));
  }

  async updateEvent(id: number, update: Partial<InsertEvent>): Promise<Event> {
    if (!db) throw new Error("Database not initialized");
    const [event] = await db.update(events).set(update).where(eq(events.id, id)).returning();
    if (!event) throw new Error("Event not found");
    return event;
  }

  // Programmes
  async getProgrammes(): Promise<Programme[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(programmes);
  }

  async createProgramme(insertProgramme: InsertProgramme): Promise<Programme> {
    if (!db) throw new Error("Database not initialized");
    const [programme] = await db.insert(programmes).values(insertProgramme).returning();
    return programme;
  }

  async deleteProgramme(id: number): Promise<void> {
    if (!db) throw new Error("Database not initialized");
    await db.delete(programmes).where(eq(programmes.id, id));
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(staff);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    if (!db) throw new Error("Database not initialized");
    const [newStaff] = await db.insert(staff).values(insertStaff).returning();
    return newStaff;
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(departments);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    if (!db) throw new Error("Database not initialized");
    const [department] = await db.insert(departments).values(insertDepartment).returning();
    return department;
  }

  // Comments
  async getComments(eventId: number): Promise<Comment[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(comments).where(eq(comments.eventId, eventId));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    if (!db) throw new Error("Database not initialized");
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }

  // Registrations
  async getRegistrations(): Promise<Registration[]> {
    if (!db) throw new Error("Database not initialized");
    return await db.select().from(registrations);
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    if (!db) throw new Error("Database not initialized");
    const [registration] = await db.insert(registrations).values(insertRegistration).returning();
    return registration;
  }
}


export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private events: Map<number, Event>;
  private programmes: Map<number, Programme>;
  private staff: Map<number, Staff>;
  private departments: Map<number, Department>;
  private comments: Map<number, Comment>;
  private registrations: Map<number, Registration>;

  private currentId: { [key: string]: number };

  constructor() {
    this.users = new Map();
    this.events = new Map();
    this.programmes = new Map();
    this.staff = new Map();
    this.departments = new Map();
    this.comments = new Map();
    this.registrations = new Map();
    this.currentId = { users: 1, events: 1, programmes: 1, staff: 1, departments: 1, comments: 1, registrations: 1 };
  }

  private getId(collection: string): number {
    return this.currentId[collection]++;
  }

  // Users
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByUsernameCaseInsensitive(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username.toLowerCase() === username.toLowerCase(),
    );
  }

  async getUserByEmailCaseInsensitive(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email?.toLowerCase() === email.toLowerCase(),
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.getId("users");
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email ?? null,
      isAdmin: insertUser.isAdmin ?? false
    };
    this.users.set(id, user);
    return user;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return Array.from(this.events.values());
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const id = this.getId("events");
    const event: Event = {
      ...insertEvent,
      id,
      createdAt: new Date(),
      imageUrl: insertEvent.imageUrl ?? null,
      videoUrl: insertEvent.videoUrl ?? null,
      isLive: insertEvent.isLive ?? false
    };
    this.events.set(id, event);
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    this.events.delete(id);
  }

  async updateEvent(id: number, update: Partial<InsertEvent>): Promise<Event> {
    const existing = this.events.get(id);
    if (!existing) throw new Error("Event not found");
    const updated = { ...existing, ...update };
    this.events.set(id, updated);
    return updated;
  }

  // Programmes
  async getProgrammes(): Promise<Programme[]> {
    return Array.from(this.programmes.values());
  }

  async createProgramme(insertProgramme: InsertProgramme): Promise<Programme> {
    const id = this.getId("programmes");
    const programme: Programme = {
      ...insertProgramme,
      id,
      day: insertProgramme.day ?? null,
      time: insertProgramme.time ?? null,
      location: insertProgramme.location ?? null
    };
    this.programmes.set(id, programme);
    return programme;
  }

  async deleteProgramme(id: number): Promise<void> {
    this.programmes.delete(id);
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return Array.from(this.staff.values());
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const id = this.getId("staff");
    const staffMember: Staff = {
      ...insertStaff,
      id,
      imageUrl: insertStaff.imageUrl ?? null,
      bio: insertStaff.bio ?? null,
      isLead: insertStaff.isLead ?? false
    };
    this.staff.set(id, staffMember);
    return staffMember;
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return Array.from(this.departments.values());
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const id = this.getId("departments");
    const department: Department = {
      ...insertDepartment,
      id,
      description: insertDepartment.description ?? null,
      imageUrl: insertDepartment.imageUrl ?? null
    };
    this.departments.set(id, department);
    return department;
  }

  // Comments
  async getComments(eventId: number): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.eventId === eventId,
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.getId("comments");
    const comment: Comment = {
      ...insertComment,
      id,
      createdAt: new Date()
    };
    this.comments.set(id, comment);
    return comment;
  }

  // Registrations
  async getRegistrations(): Promise<Registration[]> {
    return Array.from(this.registrations.values());
  }

  async createRegistration(insertRegistration: InsertRegistration): Promise<Registration> {
    const id = this.getId("registrations");
    const registration: Registration = {
      ...insertRegistration,
      id,
      createdAt: new Date()
    };
    this.registrations.set(id, registration);
    return registration;
  }
}

// Fallback to MemStorage if DATABASE_URL is not provided or if we want to force memory storage for local dev
const useDatabase = !!process.env.DATABASE_URL;
export const storage = useDatabase ? new DatabaseStorage() : new MemStorage();

if (!useDatabase) {
  console.log("ℹ️ Using In-Memory Storage (Local Development Mode)");
}

import fs from "fs";
import path from "path";

const adminFilePath = path.join(
  process.cwd(),
  "server",
  "data",
  "admin.json"
);

export type Admin = {
  id: number;
  email: string;
  password: string;
  role: "admin";
  createdAt: string;
};

export function getAdmins(): Admin[] {
  if (!fs.existsSync(adminFilePath)) {
    fs.mkdirSync(path.dirname(adminFilePath), { recursive: true });
    fs.writeFileSync(adminFilePath, JSON.stringify({ admins: [] }, null, 2));
  }

  const data = JSON.parse(fs.readFileSync(adminFilePath, "utf-8"));
  return data.admins || [];
}

export function saveAdmins(admins: Admin[]) {
  fs.writeFileSync(
    adminFilePath,
    JSON.stringify({ admins }, null, 2)
  );
}

