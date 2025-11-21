"use client";

import { useMemo, useState, useEffect } from "react";
import { usePosts } from "../lib/post-context";
import { useSearch } from "../lib/search-context";
import { useSocial } from "../lib/social-context";
import { Post } from "../lib/post-context";

interface UsePostsOptions {
  authorId?: string;
  limit?: number;
  sortBy?: "latest" | "popular";
  tag?: string;
}

export function usePostsHook(options: UsePostsOptions = {}) {
  const { posts: contextPosts, isLoading: contextLoading } = usePosts();
  const { filterPosts } = useSearch();
  const { getLikeCount } = useSocial();
  const { authorId, limit, sortBy = "latest", tag } = options;
  const [apiPosts, setApiPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch posts from API
  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        params.append('page', '1');
        if (tag) params.append('tag', tag);
        if (authorId) params.append('authorId', authorId);

        const response = await fetch(`/api/post?${params.toString()}`);
        if (response.ok) {
          const data = await response.json();
          if (data.success && data.data) {
            setApiPosts(data.data.map((post: any) => ({
              ...post,
              createdAt: new Date(post.createdAt),
              updatedAt: new Date(post.updatedAt),
            })));
          }
        }
      } catch (error) {
        console.error('Failed to fetch posts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPosts();
  }, [tag, authorId]);

  // Use API posts if available, otherwise fall back to context posts
  const posts = apiPosts.length > 0 ? apiPosts : contextPosts;

  const processedPosts = useMemo(() => {
    let result: Post[] = [...posts];

    if (authorId) {
      result = result.filter((p) => p.authorId === authorId);
    }

    result = filterPosts(result);

    result = result.sort((a, b) => {
      if (sortBy === "popular") {
        return (getLikeCount(b.id) || 0) - (getLikeCount(a.id) || 0);
      }

      return (
        new Date(b.createdAt).getTime() -
        new Date(a.createdAt).getTime()
      );
    });

    if (limit) {
      result = result.slice(0, limit);
    }

    return result;
  }, [posts, filterPosts, authorId, limit, sortBy, getLikeCount]);

  return {
    posts: processedPosts,
    isLoading: isLoading || contextLoading,
    total: processedPosts.length,
  };
}
