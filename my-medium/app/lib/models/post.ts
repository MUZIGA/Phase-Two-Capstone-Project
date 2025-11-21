import mongoose, { Schema, Model, models } from 'mongoose'

export interface PostDocument extends mongoose.Document {
  title: string
  content: string
  excerpt: string
  author: mongoose.Types.ObjectId
  tags: string[]
  published: boolean
  slug: string
  image?: string
  views: number
  likes: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const PostSchema = new Schema<PostDocument>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    excerpt: {
      type: String,
      default: '',
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    published: {
      type: Boolean,
      default: false,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
    },
    image: String,
    views: {
      type: Number,
      default: 0,
    },
    likes: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
  },
  {
    timestamps: true,
  }
)

// Slug generation is handled in API routes to ensure uniqueness

// Index for faster queries
PostSchema.index({ published: 1, createdAt: -1 })
PostSchema.index({ slug: 1 })
PostSchema.index({ tags: 1 })
PostSchema.index({ author: 1 })

const PostModel: Model<PostDocument> = models.Post || mongoose.model<PostDocument>('Post', PostSchema)

export default PostModel

