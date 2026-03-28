import mongoose, { Schema } from 'mongoose';

const transformId = (doc: any, ret: any) => {
  ret.id = ret._id.toString();
  delete ret._id;
  delete ret.__v;
  return ret;
};

const commonSchemaOptions = {
  timestamps: { createdAt: 'createdAt', updatedAt: false },
  toJSON: { transform: transformId },
  toObject: { transform: transformId }
};

const userSchema = new Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String },
  password: { type: String, required: true },
  isAdmin: { type: Boolean, default: true }
}, commonSchemaOptions);

const eventSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  imageUrl: { type: String },
  videoUrl: { type: String },
  isLive: { type: Boolean, default: false },
}, commonSchemaOptions);

const programmeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  type: { type: String, required: true },
  day: { type: String },
  time: { type: String },
  location: { type: String },
}, commonSchemaOptions);

const staffSchema = new Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  category: { type: String, required: true },
  imageUrl: { type: String },
  bio: { type: String },
  isLead: { type: Boolean, default: false }
}, commonSchemaOptions);

const departmentSchema = new Schema({
  name: { type: String, required: true },
  leader: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String },
}, commonSchemaOptions);

const commentSchema = new Schema({
  eventId: { type: String, required: true },
  name: { type: String, required: true },
  content: { type: String, required: true },
}, commonSchemaOptions);

const registrationSchema = new Schema({
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true },
  address: { type: String, required: true },
}, commonSchemaOptions);

// Check if models exist before creating them to avoid overwrite errors during hot reload
export const UserModel = mongoose.models.User || mongoose.model('User', userSchema);
export const EventModel = mongoose.models.Event || mongoose.model('Event', eventSchema);
export const ProgrammeModel = mongoose.models.Programme || mongoose.model('Programme', programmeSchema);
export const StaffModel = mongoose.models.Staff || mongoose.model('Staff', staffSchema);
export const DepartmentModel = mongoose.models.Department || mongoose.model('Department', departmentSchema);
export const CommentModel = mongoose.models.Comment || mongoose.model('Comment', commentSchema);
export const RegistrationModel = mongoose.models.Registration || mongoose.model('Registration', registrationSchema);
