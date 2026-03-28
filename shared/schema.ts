import { z } from "zod";

// Admin Users
export const insertUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email").optional().nullable(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  isAdmin: z.boolean().default(true).optional(),
});

export const userSchema = insertUserSchema.extend({
  id: z.string(),
});

// Events & Livestreams
export const insertEventSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  date: z.coerce.date(),
  imageUrl: z.string().optional().nullable(),
  videoUrl: z.string().optional().nullable(),
  isLive: z.boolean().default(false).optional(),
});

export const eventSchema = insertEventSchema.extend({
  id: z.string(),
  createdAt: z.date().optional(),
});

// Programmes
export const insertProgrammeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().min(1, "Description is required"),
  type: z.string().min(1, "Type is required"), // 'weekly' | 'special'
  day: z.string().optional().nullable(),
  time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
});

export const programmeSchema = insertProgrammeSchema.extend({
  id: z.string(),
});

// Staff
export const insertStaffSchema = z.object({
  name: z.string().min(1, "Name is required"),
  role: z.string().min(1, "Role is required"),
  category: z.string().min(1, "Category is required"), // 'pastor' | 'deacon' | 'leadership'
  imageUrl: z.string().optional().nullable(),
  bio: z.string().optional().nullable(),
  isLead: z.boolean().default(false).optional(),
});

export const staffSchema = insertStaffSchema.extend({
  id: z.string(),
});

// Departments
export const insertDepartmentSchema = z.object({
  name: z.string().min(1, "Name is required"),
  leader: z.string().min(1, "Leader is required"),
  description: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export const departmentSchema = insertDepartmentSchema.extend({
  id: z.string(),
});

// Comments
export const insertCommentSchema = z.object({
  eventId: z.union([z.string(), z.number()]).transform(String),
  name: z.string().min(1, "Name is required"),
  content: z.string().min(1, "Content is required"),
});

export const commentSchema = insertCommentSchema.extend({
  id: z.string(),
  createdAt: z.date().optional(),
});

// Registrations
export const insertRegistrationSchema = z.object({
  fullName: z.string().min(1, "Full name is required"),
  phone: z.string().min(1, "Phone is required"),
  email: z.string().email("Invalid email"),
  address: z.string().min(1, "Address is required"),
});

export const registrationSchema = insertRegistrationSchema.extend({
  id: z.string(),
  createdAt: z.date().optional(),
});

// Types
export type User = z.infer<typeof userSchema>;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Event = z.infer<typeof eventSchema>;
export type InsertEvent = z.infer<typeof insertEventSchema>;
export type Programme = z.infer<typeof programmeSchema>;
export type InsertProgramme = z.infer<typeof insertProgrammeSchema>;
export type Staff = z.infer<typeof staffSchema>;
export type InsertStaff = z.infer<typeof insertStaffSchema>;
export type Department = z.infer<typeof departmentSchema>;
export type InsertDepartment = z.infer<typeof insertDepartmentSchema>;
export type Comment = z.infer<typeof commentSchema>;
export type InsertComment = z.infer<typeof insertCommentSchema>;
export type Registration = z.infer<typeof registrationSchema>;
export type InsertRegistration = z.infer<typeof insertRegistrationSchema>;
