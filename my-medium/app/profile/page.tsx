"use client";
import Link from "next/link";
import Image from "next/image";
import React, { useState } from "react";
import { useAuth } from "../lib/auth-context";
import { useUserStats } from "../hooks/use-user-stats";
import { Button } from "../components/ui/button";
import ProtectedRoute from "../components/ProtectedRoute";
import Container from "../components/Container";
import { usePosts } from "../lib/post-context";

function usePostsByAuthor(authorId: string) {
  const { posts, isLoading } = usePosts();
  const data = React.useMemo(() => 
    posts.filter(post => post.authorId === authorId && post.published),
    [posts, authorId]
  );
  return { data, isLoading };
}

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const stats = useUserStats(user?.id || "");
  const { data: posts = [], isLoading: postsLoading } = usePostsByAuthor(
    user?.id || ""
  );
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ name: "", bio: "" });

  
  React.useEffect(() => {
    if (user) {
      setEditData({ name: user.name || "", bio: user.bio || "" });
    }
  }, [user]);
  const [isSaving, setIsSaving] = useState(false);
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

  const handleEdit = () => {
    console.log('Edit button clicked');
    setEditData({ name: user?.name || "", bio: user?.bio || "" });
    setIsEditing(true);
  };

  const handleSave = async () => {
    console.log('Save button clicked');
    if (!editData.name.trim()) {
      alert('Name cannot be empty');
      return;
    }
    
    setIsSaving(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error: any) {
      console.error('Failed to update profile:', error);
      const errorMessage = error?.message || 'Failed to update profile. Please try again.';
      alert(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    console.log('Cancel button clicked');
    setEditData({ name: user?.name || "", bio: user?.bio || "" });
    setIsEditing(false);
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    
    try {
      const response = await fetch(`/api/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        }
      });
      
      if (response.ok) {
        alert('Post deleted successfully!');
        window.location.reload();
      } else {
        throw new Error('Failed to delete post');
      }
    } catch (error) {
      console.error('Delete error:', error);
      alert('Failed to delete post. Please try again.');
    }
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
                    <p className="text-2xl font-bold text-slate-800">{stats.totalPosts}</p>
                    <p className="text-sm text-slate-600">Posts</p>
                  </div>
                  <Link href={`/profile/${user?.id}/followers`} className="text-center rounded-lg p-2">
                    <p className="text-2xl font-bold text-slate-800">{stats.followers}</p>
                    <p className="text-sm text-slate-600">Followers</p>
                  </Link>
                  <Link href={`/profile/${user?.id}/following`} className="text-center rounded-lg p-2">
                    <p className="text-2xl font-bold text-slate-800">{stats.following}</p>
                    <p className="text-sm text-slate-600">Following</p>
                  </Link>
                </div>
              </div>
              <div className="space-y-6">
                <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                  <label className="mb-2 block text-sm font-semibold text-slate-700">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editData.name}
                      onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:border-teal-500 focus:outline-none"
                      placeholder="Enter your full name"
                    />
                  ) : (
                    <p className="text-lg text-slate-800">{user?.name || "Not set"}</p>
                  )}
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
                  {isEditing ? (
                    <textarea
                      value={editData.bio}
                      onChange={(e) => setEditData(prev => ({ ...prev, bio: e.target.value }))}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-lg focus:border-teal-500 focus:outline-none resize-none"
                      rows={4}
                      placeholder="Tell us about yourself..."
                    />
                  ) : (
                    <p className="text-lg text-slate-800">
                      {user?.bio || "No bio set yet. Tell us about yourself!"}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {isEditing ? (
                  <>
                    <Button
                      onClick={handleSave}
                      disabled={isSaving}
                      type="button"
                      className="flex-1 rounded-lg bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-md hover:opacity-90 cursor-pointer"
                    >
                      {isSaving ? "Saving..." : "Save"}
                    </Button>
                    <Button
                      onClick={handleCancel}
                      variant="outline"
                      type="button"
                      className="flex-1 rounded-lg border-2 border-slate-300 bg-white px-6 py-3 font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                    >
                      Cancel
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={handleEdit}
                    type="button"
                    className="w-full rounded-lg bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-md hover:opacity-90 cursor-pointer"
                  >
                    Edit Profile
                  </Button>
                )}
              </div>
            </div>
            {/* Activity Summary */}
            <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
              <h3 className="mb-6 text-2xl font-bold text-slate-800">Activity Summary</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-teal-50 rounded-lg">
                  <div className="text-2xl font-bold text-teal-600">{posts.reduce((sum, post) => sum + (post.likes || 0), 0)}</div>
                  <div className="text-sm text-slate-600">Total Likes</div>
                </div>
                <div className="text-center p-4 bg-cyan-50 rounded-lg">
                  <div className="text-2xl font-bold text-cyan-600">{posts.reduce((sum, post) => sum + (post.comments || 0), 0)}</div>
                  <div className="text-sm text-slate-600">Total Comments</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{posts.reduce((sum, post) => sum + (post.views || 0), 0)}</div>
                  <div className="text-sm text-slate-600">Total Views</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{stats.followers}</div>
                  <div className="text-sm text-slate-600">Followers</div>
                </div>
              </div>
            </div>

            <div className="mt-8 rounded-2xl bg-white p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-slate-800">My Posts</h3>
                <Link href="/write" className="px-4 py-2 bg-teal-600 text-white rounded-lg">
                  Write New Post
                </Link>
              </div>
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
                    className="inline-block rounded-lg bg-gradient-to-r from-teal-600 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg"
                  >
                    Create Your First Post
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  {posts.map((post) => (
                    <div key={post.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                      <Link href={`/posts/${post.slug}`}>
                        {post.image ? (
                          <div className="relative mb-4 h-32 w-full overflow-hidden rounded-lg">
                            <Image
                              src={post.image}
                              alt={post.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, 50vw"
                            />
                          </div>
                        ) : (
                          <div className="mb-4 flex h-32 w-full items-center justify-center rounded-lg bg-gradient-to-br from-teal-100 to-cyan-100">
                            <span className="text-2xl">📄</span>
                          </div>
                        )}
                        <h4 className="mb-2 text-lg font-bold text-slate-800">
                          {post.title}
                        </h4>
                        <p className="mb-3 line-clamp-2 text-sm text-slate-600">
                          {post.excerpt || stripHtml(post.content)}
                        </p>
                      </Link>
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        <span>{formatDate(post.createdAt.toString())}</span>
                        <div className="flex items-center gap-3">
                          {post.views !== undefined && (
                            <span>👁 {post.views}</span>
                          )}
                          {post.likes !== undefined && (
                            <span>❤️ {post.likes}</span>
                          )}
                        </div>
                      </div>
                      <div className="mt-4 flex gap-2">
                        <Link
                          href={`/write?draft=${post.id}`}
                          className="px-3 py-1 bg-blue-500 text-white text-xs rounded"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            handleDeletePost(post.id);
                          }}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
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
