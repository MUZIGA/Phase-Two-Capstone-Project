import mongoose, { Schema, Model, models } from 'mongoose'

export interface UserDocument extends mongoose.Document {
  name: string
  email: string
  password: string
  avatar?: string
  bio?: string
  createdAt: Date
  updatedAt: Date
}

const UserSchema = new Schema<UserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
    avatar: String,
    bio: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
)

const UserModel: Model<UserDocument> = models.User || mongoose.model<UserDocument>('User', UserSchema)

export default UserModel

