import mongoose, { Schema, Model, models } from 'mongoose'

export interface UserDocument extends mongoose.Document {
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
    followers: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    following: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
)

const UserModel: Model<UserDocument> = models.User || mongoose.model<UserDocument>('User', UserSchema)

export default UserModel

