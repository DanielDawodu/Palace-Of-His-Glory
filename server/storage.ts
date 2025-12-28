import { 
  users, events, programmes, staff, departments, comments,
  type User, type InsertUser,
  type Event, type InsertEvent,
  type Programme, type InsertProgramme,
  type Staff, type InsertStaff,
  type Department, type InsertDepartment,
  type Comment, type InsertComment
} from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
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
}

export class DatabaseStorage implements IStorage {
  // Users
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    return await db.select().from(events);
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const [event] = await db.insert(events).values(insertEvent).returning();
    return event;
  }

  async deleteEvent(id: number): Promise<void> {
    await db.delete(events).where(eq(events.id, id));
  }

  // Programmes
  async getProgrammes(): Promise<Programme[]> {
    return await db.select().from(programmes);
  }

  async createProgramme(insertProgramme: InsertProgramme): Promise<Programme> {
    const [programme] = await db.insert(programmes).values(insertProgramme).returning();
    return programme;
  }

  async deleteProgramme(id: number): Promise<void> {
    await db.delete(programmes).where(eq(programmes.id, id));
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    return await db.select().from(staff);
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const [newStaff] = await db.insert(staff).values(insertStaff).returning();
    return newStaff;
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    return await db.select().from(departments);
  }

  async createDepartment(insertDepartment: InsertDepartment): Promise<Department> {
    const [department] = await db.insert(departments).values(insertDepartment).returning();
    return department;
  }

  // Comments
  async getComments(eventId: number): Promise<Comment[]> {
    return await db.select().from(comments).where(eq(comments.eventId, eventId));
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const [comment] = await db.insert(comments).values(insertComment).returning();
    return comment;
  }
}

export const storage = new DatabaseStorage();
