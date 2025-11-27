export interface User {
  id: string
  name: string
  email: string
  bio?: string
  avatar?: string
  createdAt: Date | string
  updatedAt: Date | string
}

export interface Post {
  comments: number
  id: string
  title: string
  content: string
  excerpt: string
  author: string
  authorId: string
  tags: string[]
  published: boolean
  createdAt: Date | string
  updatedAt: Date | string
  slug: string
  image?: string
  views?: number
  likes?: number
}

export interface Comment {
  id: string
  postId: string
  author: string
  authorId: string
  content: string
  createdAt: string
  likes: string[]
  parentId?: string
  replies?: Comment[]
}

export interface Tag {
  id: string
  name: string
  slug: string
  postCount: number
  createdAt: Date | string
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export interface AuthResponse extends ApiResponse {
  data?: {
    user: User
    token: string
  }
}

export interface PostResponse extends ApiResponse {
  data?: Post
}

export interface PostsResponse extends PaginatedResponse<Post> {}

export interface CommentResponse extends ApiResponse {
  data?: Comment
}

export interface CommentsResponse extends ApiResponse {
  data?: Comment[]
}

export interface LikeResponse extends ApiResponse {
  data?: {
    liked: boolean
    likesCount: number
  }
}

export interface FollowResponse extends ApiResponse {
  data?: {
    following: boolean
    followersCount: number
    followingCount: number
  }
}