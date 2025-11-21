"use client";
import Link from "next/link";
import Image from "next/image";
import { useAuth } from "../lib/auth-context";
export default function ProfilePage() {
  const { user } = useAuth();
  const { data: posts = [], isLoading: postsLoading } = usePostsByAuthor(
    user?.id || ""
  );
  const followingCount = 0;
  const followersCount = 0;
  const isLoading = postsLoading || !user;
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };
  const stripHtml = (html: string) => {
    if (typeof window === "undefined") {
      return html.replace(/<[^>]*>/g, "").substring(0, 150);
    }
    const tmp = document.createElement("DIV");
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || "";
  };
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-b from-white to-teal-50/30 py-16">
        <Container>
          <div className="mx-auto max-w-4xl">
            <div className="mb-8 text-center">
              <h1 className="mb-4 bg-gradient-to-r from-teal-600 via-cyan-500 to-teal-600 bg-clip-text text-5xl font-extrabold text-transparent">
                My Profile
              </h1>
              <p className="text-slate-600">Manage your account and settings</p>
            </div>
            <div className="rounded-2xl bg-white p-8 shadow-lg">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-500 to-cyan-400 text-4xl font-bold text-white shadow-lg">
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </div>
                <h2 className="text-2xl font-bold text-slate-800">{user?.name}</h2>
                <p className="text-slate-600">{user?.email}</p>
                <div className="mt-4 flex items-center justify-center gap-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">{posts.length}</p>
                    <p className="text-sm text-slate-600">Posts</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">{followersCount}</p>
                    <p className="text-sm text-slate-600">Followers</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-slate-800">{followingCount}</p>
                    <p className="text-sm text-slate-600">Following</p>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  <p className="text-lg text-slate-800">{user?.name || "Not set"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Email Address
                  </label>
                  <p className="text-lg text-slate-800">{user?.email || "Not set"}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Bio
                  </label>
                  <p className="text-lg text-slate-800">
                    {user?.bio || "No bio set yet. Tell us about yourself!"}
                  </p>
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <button className="flex-1 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg">
                  Edit Profile
                </button>
                <button className="flex-1 rounded-lg border-2 border-teal-600 bg-white px-6 py-3 font-semibold text-teal-600 transition-all duration-300 hover:bg-teal-50">
                  Change Password
                </button>
              </div>
            </div>
            <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="mb-6 text-2xl font-bold text-slate-800">My Posts</h3>
              {isLoading && !user ? (
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
                  <p className="text-slate-600">Loading...</p>
                </div>
              ) : isLoading ? (
                <div className="text-center">
                  <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-teal-600 border-t-transparent"></div>
                  <p className="text-slate-600">Loading posts...</p>
                </div>
              ) : posts.length === 0 ? (
                <div className="rounded-lg bg-slate-50 p-8 text-center">
                  <p className="mb-4 text-slate-600">
                    You haven&apos;t published any posts yet.
                  </p>
                  <Link
                    href="/editor"
                    className="inline-block rounded-lg bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:shadow-xl"
                  >
                    Create Your First Post
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {posts.map((post) => (
                    <Link
                      key={post.id}
                      href={`/posts/${post.slug}`}
                      className="group rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:scale-105 hover:shadow-lg"
                    >
                      {post.image ? (
                        <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg">
                          <Image
                            src={post.featuredImage}
                            alt={post.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-110"
                            sizes="(max-width: 768px) 100vw, 50vw"
                          />
                        </div>
                      ) : (
                        <div className="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100">
                          <span className="text-2xl">:page_facing_up:</span>
                        </div>
                      )}
                      <h4 className="mb-2 text-lg font-bold text-slate-800 group-hover:text-teal-600 transition-colors">
                        {post.title}
                      </h4>
                      <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                        {post.excerpt || stripHtml(post.content)}
                      </p>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{formatDate(post.createdAt.toString())}</span>
                        <div className="flex items-center gap-3">
                          {post.views !== undefined && (
                            <span>:eye: {post.views}</span>
                          )}
                          {post.likes !== undefined && (
                            <span>:heart: {post.likes}</span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}










import { usePosts } from "../lib/post-context";
import ProtectedRoute from "../components/ProtectedRoute";
import Container from "../components/Container";
import React from "react";

function usePostsByAuthor(authorId: string) {
  const { posts, isLoading } = usePosts();
  const data = posts.filter(post => post.authorId === authorId && post.published);
  return { data, isLoading };
}

function followingCount(authorId: string) {
  // Placeholder for following count
  return { data: 0 };
}

function followersCount(authorId: string) {
  // Placeholder for followers count
  return { data: 0 };
}
