import { renderHook, act } from '@testing-library/react'
import { ReactNode } from 'react'
import { PostProvider, usePosts } from '@/lib/post-context'

const wrapper = ({ children }: { children: ReactNode }) => (
  <PostProvider>{children}</PostProvider>
)

describe('usePosts Hook', () => {
  beforeEach(() => {
    ;(global.fetch as jest.Mock).mockClear()
  })

  it('initializes with empty posts and loading state', () => {
    ;(global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: [] })
    })

    const { result } = renderHook(() => usePosts(), { wrapper })
    
    expect(result.current.posts).toEqual([])
    expect(result.current.drafts).toEqual([])
    expect(result.current.isLoading).toBe(true)
    expect(result.current.error).toBe(null)
  })

  it('creates a draft successfully', async () => {
    ;(global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true, data: [] })
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          success: true,
          data: {
            id: '1',
            title: 'Test Draft',
            content: 'Test content',
            published: false
          }
        })
      })

    const { result } = renderHook(() => usePosts(), { wrapper })
    
    await act(async () => {
      const draftId = await result.current.createDraft('Test Draft', 'Test content', 'user1', 'Test User')
      expect(draftId).toBe('1')
    })
  })

  it('handles fetch errors gracefully', async () => {
    ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

    const { result } = renderHook(() => usePosts(), { wrapper })
    
    expect(result.current.error).toBe('Failed to fetch posts')
  })
})