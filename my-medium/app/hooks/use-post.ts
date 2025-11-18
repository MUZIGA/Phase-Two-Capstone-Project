"use client";

import { useMemo } from "react";
import { usePosts } from "../lib/post-context";
import { useSearch } from "../lib/search-context";
import { useSocial } from "../lib/social-context";
import { Post } from "../lib/post-context";

interface UsePostsOptions {
  authorId?: string;
  limit?: number;
  sortBy?: "latest" | "popular";
}

export function usePostsHook(options: UsePostsOptions = {}) {
  const { posts, drafts } = usePosts();
  const { filterPosts } = useSearch();
  const { getLikeCount } = useSocial();
  const { authorId, limit, sortBy = "latest" } = options;

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
    drafts,
    isLoading: false,
    total: processedPosts.length,
  };
}
