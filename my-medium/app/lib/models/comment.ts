import mongoose, { Schema, Model, models } from 'mongoose'

export interface CommentDocument extends mongoose.Document {
  postId: mongoose.Types.ObjectId
  author: mongoose.Types.ObjectId
  content: string
  likes: mongoose.Types.ObjectId[]
  createdAt: Date
  updatedAt: Date
}

const CommentSchema = new Schema<CommentDocument>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
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

// Index for faster queries
CommentSchema.index({ postId: 1, createdAt: -1 })
CommentSchema.index({ author: 1 })

const CommentModel: Model<CommentDocument> = models.Comment || mongoose.model<CommentDocument>('Comment', CommentSchema)

export default CommentModel

