import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export const usePost = (id: string) => {
  return useQuery({
    queryKey: ['post', id],
    queryFn: () => fetch(`/api/post/${id}`).then(res => res.json())
  })
}

export const useCreatePost = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: any) => fetch('/api/post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).then(res => res.json()),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['posts'] })
  })
}