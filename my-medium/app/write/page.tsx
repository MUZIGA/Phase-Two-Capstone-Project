"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../lib/auth-context";
import { usePosts } from "../lib/post-context";
import { RichTextEditor } from "../components/rich-text-editor";
import { EditorPreview } from "../components/editor-preview";
import { ImageUploader } from "../components/image-uploader";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function WritePage() {
  const { user } = useAuth();
  const { createDraft, updateDraft, publishPost, getDraftById, refreshPosts } = usePosts();
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

  // Load draft if editing
  useEffect(() => {
    if (draftId && user) {
      const draft = getDraftById(draftId);
      if (draft && draft.authorId === user.id) {
        setTitle(draft.title);
        setContent(draft.content);
        setExcerpt(draft.excerpt);
        setTags(draft.tags.join(", "));
        setImage(draft.image || "");
      }
    }
  }, [draftId, user, getDraftById]);

  // Generate excerpt from content
  useEffect(() => {
    const plainText = content.replace(/<[^>]*>/g, "");
    setExcerpt(plainText.substring(0, 150));
  }, [content]);

  // Save or update draft
  const handleSaveDraft = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!user) {
      alert("Please sign in to save drafts");
      router.push("/login");
      return;
    }

    // Check if token exists
    const token = localStorage.getItem('auth_token');
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
        if (tagArray.length > 0 || image) {
          await updateDraft(newDraftId, { tags: tagArray, image });
        }
        alert("Draft saved!");
      }
    } catch (error: any) {
      console.error("Failed to save draft:", error);
      alert(error.message || "Failed to save draft. Please try again.");
    }
  };

  // Publish post
  const handlePublish = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (!content.trim()) {
      alert("Please write some content");
      return;
    }

    if (!user) {
      alert("Please sign in to publish posts");
      return;
    }

    setIsPublishing(true);

    try {
      const tagArray = tags.split(",").map((t) => t.trim()).filter(Boolean);
      
      // If no draft exists, create one first
      let draftId = currentDraftId;
      if (!draftId) {
        draftId = await createDraft(title, content, user.id, user.name);
        setCurrentDraftId(draftId);
        if (tagArray.length > 0 || image) {
          await updateDraft(draftId, { tags: tagArray, image });
        }
      }

      await publishPost(draftId, tagArray, image);
      await refreshPosts();
      alert("Post published successfully!");
      router.push("/explore");
    } catch (error) {
      console.error("Failed to publish post:", error);
      alert("Failed to publish post. Please try again.");
    } finally {
      setIsPublishing(false);
    }
  };

  if (!user) return null;

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {currentDraftId ? "Edit Post" : "Write a New Post"}
            </h1>
            <p className="text-muted-foreground">Share your thoughts with the world</p>
          </div>
          <Link href="/dashboard" className="text-primary hover:text-primary/80">
            ← Back
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Editor */}
          <div className="lg:col-span-2">
            <Card className="p-6 space-y-6">
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Post Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Enter post title..."
                  className="w-full text-3xl font-bold bg-background text-foreground placeholder:text-muted-foreground focus:outline-none"
                />
              </div>

              {/* Featured Image */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Featured Image</label>
                <ImageUploader onImageSelected={setImage} />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Content</label>
                <RichTextEditor value={content} onChange={setContent} placeholder="Tell your story..." />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">Tags (comma-separated)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="e.g. React, Next.js, Web Development"
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-xs text-muted-foreground mt-1">Separate tags with commas</p>
              </div>
            </Card>
          </div>

          {/* Preview & Actions */}
          <div className="space-y-6">
            {image && (
              <Card className="overflow-hidden">
                <img src={image || "/placeholder.svg"} alt="Featured" className="w-full h-40 object-cover" />
              </Card>
            )}

            <Card className="p-6">
              <h3 className="text-lg font-bold text-foreground mb-4">Preview</h3>
              <EditorPreview title={title} content={content} excerpt={excerpt} />
            </Card>

            <Card className="p-4 space-y-3">
              <Button onClick={handleSaveDraft} variant="outline" className="w-full">
                Save as Draft
              </Button>

              <Button onClick={handlePublish} disabled={isPublishing} className="w-full">
                {isPublishing ? "Publishing..." : "Publish Post"}
              </Button>
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
