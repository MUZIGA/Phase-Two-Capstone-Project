"use client";

export const dynamic = "force-dynamic"; // This disables SSR for this page

import { useState, useEffect, useCallback, Suspense } from "react";
import { useAuth } from "../lib/auth-context";
import { usePosts } from "../lib/post-context";
import { RichTextEditor } from "../components/rich-text-editor";
import { EditorPreview } from "../components/editor-preview";
import { ImageUploader } from "../components/image-uploader";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function WritePageContent() {
  const { user } = useAuth();
  const { createDraft, updateDraft, getDraftById, refreshPosts } = usePosts();
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftId = searchParams.get("draft");

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [tags, setTags] = useState("");
  const [image, setImage] = useState("");
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(draftId);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!user) router.push("/login");
  }, [user, router]);

  // Load draft safely
  const loadDraft = useCallback(() => {
    if (!draftId || !user) return;

    const draft = getDraftById(draftId);
    if (!draft || draft.authorId !== user.id) return;

    setTitle(draft.title || "");
    setContent(draft.content || "");
    setExcerpt(draft.excerpt || "");
    setTags(draft.tags ? draft.tags.join(", ") : "");
    setImage(draft.image || "");
  }, [draftId, user, getDraftById]);

  useEffect(() => {
    loadDraft();
  }, [loadDraft]);

  // Auto-generate excerpt
  useEffect(() => {
    const plainText = content.replace(/<[^>]*>/g, "");
    setExcerpt(plainText.substring(0, 150));
  }, [content]);

  const handleSaveDraft = async () => {
    if (!title.trim()) return alert("Please enter a title");
    if (!user) {
      alert("Please sign in to save drafts");
      router.push("/login");
      return;
    }

    const token = localStorage.getItem("auth_token");
    if (!token) {
      alert("Your session has expired. Please log in again.");
      router.push("/login");
      return;
    }

    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      if (currentDraftId) {
        await updateDraft(currentDraftId, { title, content, excerpt, tags: tagArray, image });
        alert("Draft updated!");
      } else {
        const newDraftId = await createDraft(title, content, user.id, user.name);
        setCurrentDraftId(newDraftId);
        alert("Draft saved!");
      }
    } catch (error: any) {
      console.error("Failed to save draft:", error);
      alert(error.message || "Failed to save draft. Please try again.");
    }
  };

  const handlePublish = async () => {
    if (!title.trim()) return alert("Please enter a title");
    if (!content.trim()) return alert("Please write some content");
    if (!user) return alert("Please sign in to publish posts");

    setIsPublishing(true);
    const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);

    try {
      const response = await fetch("/api/post", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("auth_token")}`,
        },
        body: JSON.stringify({ title: title.trim(), content, excerpt, tags: tagArray, image, published: true }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to publish post");
      }

      await refreshPosts();
      alert("Post published successfully!");
      router.push("/explore");
    } catch (error: any) {
      console.error("Failed to publish post:", error);
      alert(error.message || "Failed to publish post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">{currentDraftId ? "Edit Post" : "Write a New Post"}</h1>
            <p className="text-muted-foreground">Share your thoughts with the world</p>
          </div>
          <Link href="/dashboard" className="text-primary hover:text-primary/80">← Back</Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Post Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter post title..." className="w-full text-3xl font-bold bg-background text-foreground placeholder:text-muted-foreground focus:outline-none"/>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Featured Image</label>
                <ImageUploader onImageSelected={setImage} initialImage={image || ""} />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                <RichTextEditor value={content} onChange={setContent} placeholder="Tell your story..." />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags (comma-separated)</label>
                <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="e.g. React, Next.js, Web Development" className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary" />
                <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
              </div>
            </Card>
          </div>

          <div className="space-y-6">
            {image && (
              <Card className="overflow-hidden">
                <div className="relative w-full h-40">
                  <img src={image} alt="Featured Image" className="w-full h-full object-cover" />
                </div>
                <div className="p-2 text-center">
                  <p className="text-xs text-muted-foreground">Featured Image Preview</p>
                </div>
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Preview</h3>
              <EditorPreview title={title} content={content} excerpt={excerpt} />
            </Card>

            <Card className="p-4 space-y-3">
              <Button onClick={handleSaveDraft} variant="outline" className="w-full">Save as Draft</Button>
              <Button onClick={handlePublish} disabled={isPublishing} className="w-full">{isPublishing ? "Publishing..." : "Publish Post"}</Button>
            </Card>

            <Card className="p-4 bg-muted/50">
              <h4 className="font-semibold text-foreground mb-2">Tips</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Add a featured image</li>
                <li>• Use clear headings</li>
                <li>• Keep it readable</li>
                <li>• Use relevant tags</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function WritePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <WritePageContent />
    </Suspense>
  );
}
