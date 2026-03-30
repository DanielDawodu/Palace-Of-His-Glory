import {
  type User, type InsertUser,
  type Event, type InsertEvent,
  type Programme, type InsertProgramme,
  type Staff, type InsertStaff,
  type Department, type InsertDepartment,
  type Comment, type InsertComment,
  type Registration, type InsertRegistration
} from "../shared/schema.js";
import { 
  UserModel, EventModel, ProgrammeModel, StaffModel, 
  DepartmentModel, CommentModel, RegistrationModel 
} from "./models.js";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByUsernameCaseInsensitive(username: string): Promise<User | undefined>;
  getUserByEmailCaseInsensitive(email: string): Promise<User | undefined>;
  getAdmins(): Promise<User[]>;
  createUser(user: InsertUser): Promise<User>;

  // Events
  getEvents(): Promise<Event[]>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: string, event: Partial<InsertEvent> | { isLive: boolean, videoUrl?: string }): Promise<Event>;
  deleteEvent(id: string): Promise<void>;

  // Programmes
  getProgrammes(): Promise<Programme[]>;
  createProgramme(programme: InsertProgramme): Promise<Programme>;
  deleteProgramme(id: string): Promise<void>;

  // Staff
  getStaff(): Promise<Staff[]>;
  createStaff(staff: InsertStaff): Promise<Staff>;

  // Departments
  getDepartments(): Promise<Department[]>;
  createDepartment(department: InsertDepartment): Promise<Department>;

  // Comments
  getComments(eventId: string): Promise<Comment[]>;
  createComment(comment: InsertComment): Promise<Comment>;

  // Registrations
  getRegistrations(): Promise<Registration[]>;
  createRegistration(registration: InsertRegistration): Promise<Registration>;
}

function mapId(doc: any) {
  if (!doc) return doc;
  if (doc._id) {
    doc.id = doc._id.toString();
    delete doc._id;
  }
  delete doc.__v;
  return doc;
}

export class MongoStorage implements IStorage {
  // Users
  async getUser(id: string): Promise<User | undefined> {
    const user = await UserModel.findById(id).lean();
    return user ? (mapId(user) as unknown as User) : undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({ username }).lean();
    return user ? (mapId(user) as unknown as User) : undefined;
  }

  async getUserByUsernameCaseInsensitive(username: string): Promise<User | undefined> {
    const user = await UserModel.findOne({
      username: { $regex: new RegExp(`^${username}$`, "i") }
    }).lean();
    return user ? (mapId(user) as unknown as User) : undefined;
  }

  async getUserByEmailCaseInsensitive(email: string): Promise<User | undefined> {
    const user = await UserModel.findOne({
      email: { $regex: new RegExp(`^${email}$`, "i") }
    }).lean();
    return user ? (mapId(user) as unknown as User) : undefined;
  }

  async getAdmins(): Promise<User[]> {
    const users = await UserModel.find({ isAdmin: true }).lean();
    return users.map(mapId) as unknown as User[];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user = await UserModel.create(insertUser);
    return mapId(user.toJSON()) as unknown as User;
  }

  // Events
  async getEvents(): Promise<Event[]> {
    const events = await EventModel.find({}).lean();
    return events.map(mapId) as unknown as Event[];
  }

  async createEvent(insertEvent: InsertEvent): Promise<Event> {
    const event = await EventModel.create(insertEvent);
    return mapId(event.toJSON()) as unknown as Event;
  }

  async deleteEvent(id: string): Promise<void> {
    await EventModel.findByIdAndDelete(id);
  }

  async updateEvent(id: string, update: Partial<InsertEvent>): Promise<Event> {
    const event = await EventModel.findByIdAndUpdate(id, update, { new: true }).lean();
    if (!event) throw new Error("Event not found");
    return mapId(event) as unknown as Event;
  }

  // Programmes
  async getProgrammes(): Promise<Programme[]> {
    const programmes = await ProgrammeModel.find({}).lean();
    return programmes.map(mapId) as unknown as Programme[];
  }

  async createProgramme(insertProgramme: InsertProgramme): Promise<Programme> {
    const programme = await ProgrammeModel.create(insertProgramme);
    return mapId(programme.toJSON()) as unknown as Programme;
  }

  async deleteProgramme(id: string): Promise<void> {
    await ProgrammeModel.findByIdAndDelete(id);
  }

  // Staff
  async getStaff(): Promise<Staff[]> {
    const staff = await StaffModel.find({}).lean();
    return staff.map(mapId) as unknown as Staff[];
  }

  async createStaff(insertStaff: InsertStaff): Promise<Staff> {
    const staff = await StaffModel.create(insertStaff);
    return mapId(staff.toJSON()) as unknown as Staff;
  }

  // Departments
  async getDepartments(): Promise<Department[]> {
    const depts = await DepartmentModel.find({}).lean();
    return depts.map(mapId) as unknown as Department[];
  }

  async createDepartment(insertDept: InsertDepartment): Promise<Department> {
    const dept = await DepartmentModel.create(insertDept);
    return mapId(dept.toJSON()) as unknown as Department;
  }

  // Comments
  async getComments(eventId: string): Promise<Comment[]> {
    const comments = await CommentModel.find({ eventId }).lean();
    return comments.map(mapId) as unknown as Comment[];
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const comment = await CommentModel.create(insertComment);
    return mapId(comment.toJSON()) as unknown as Comment;
  }

  // Registrations
  async getRegistrations(): Promise<Registration[]> {
    const regs = await RegistrationModel.find({}).lean();
    return regs.map(mapId) as unknown as Registration[];
  }

  async createRegistration(insertReg: InsertRegistration): Promise<Registration> {
    const reg = await RegistrationModel.create(insertReg);
    return mapId(reg.toJSON()) as unknown as Registration;
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private events: Map<string, Event>;
  private programmes: Map<string, Programme>;
  private staff: Map<string, Staff>;
  private departments: Map<string, Department>;
  private comments: Map<string, Comment>;
  private registrations: Map<string, Registration>;

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

  private getId(collection: string): string {
    return (this.currentId[collection]++).toString();
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
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

  async getAdmins(): Promise<User[]> {
    return Array.from(this.users.values()).filter(u => u.isAdmin);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.getId("users");
    const user: User = {
      ...insertUser,
      id,
      email: insertUser.email ?? null,
      isAdmin: insertUser.isAdmin ?? true
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

  async deleteEvent(id: string): Promise<void> {
    this.events.delete(id);
  }

  async updateEvent(id: string, update: Partial<InsertEvent>): Promise<Event> {
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

  async deleteProgramme(id: string): Promise<void> {
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
  async getComments(eventId: string): Promise<Comment[]> {
    return Array.from(this.comments.values()).filter(
      (comment) => comment.eventId === eventId,
    );
  }

  async createComment(insertComment: InsertComment): Promise<Comment> {
    const id = this.getId("comments");
    const comment: Comment = {
      ...insertComment,
      id,
      eventId: insertComment.eventId,
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

// Fallback to MemStorage if MONGODB_URI is not provided
const useDatabase = !!process.env.MONGODB_URI;
export const storage = useDatabase ? new MongoStorage() : new MemStorage();

if (!useDatabase) {
  console.log("ℹ️ Using In-Memory Storage (Local Development Mode)");
}
