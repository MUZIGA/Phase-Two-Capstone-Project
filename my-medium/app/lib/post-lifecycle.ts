// Post lifecycle management
export interface PostLifecycleState {
  draft: boolean
  published: boolean
  archived?: boolean
  scheduled?: Date
}

export interface CreatePostRequest {
  title: string
  content: string
  excerpt?: string
  tags?: string[]
  image?: string
  published?: boolean
  scheduledAt?: Date
}

export interface UpdatePostRequest extends Partial<CreatePostRequest> {
  action?: 'save' | 'publish' | 'unpublish' | 'archive'
}

export class PostLifecycleManager {
  static async createPost(data: CreatePostRequest, authorId: string) {
    const response = await fetch('/api/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify({
        ...data,
        authorId
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to create post')
    }

    return response.json()
  }

  static async updatePost(id: string, data: UpdatePostRequest) {
    const response = await fetch(`/api/post/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
      },
      body: JSON.stringify(data)
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.error || 'Failed to update post')
    }

    return response.json()
  }

  static async publishDraft(id: string, updates?: Partial<CreatePostRequest>) {
    return this.updatePost(id, {
      ...updates,
      published: true,
      action: 'publish'
    })
  }

  static async saveDraft(id: string, updates: Partial<CreatePostRequest>) {
    return this.updatePost(id, {
      ...updates,
      published: false,
      action: 'save'
    })
  }

  static async unpublishPost(id: string) {
    return this.updatePost(id, {
      published: false,
      action: 'unpublish'
    })
  }
}