import mongoose, { Schema, Model, models, Document } from 'mongoose'

// Interface for TypeScript
export interface UserDocument extends Document {
  name: string
  email: string
  password: string
  avatar?: string
  bio?: string
  followers: mongoose.Types.ObjectId[]
  following: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

// Schema definition
const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    avatar: String,
    bio: { type: String, default: '' },
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

// Export model safely (prevents "Cannot overwrite model" errors in dev/hot reload)
const User: Model<UserDocument> = models.User || mongoose.model<UserDocument>('User', UserSchema)

export default User
