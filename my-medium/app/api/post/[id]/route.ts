import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/post";
import { authenticateRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const updates = await request.json();
    await connectToDatabase();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.author.toString() !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Handle draft to publish transition
    if (!post.published && updates.published) {
      const baseSlug = updates.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || 
                      post.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
      let slug = baseSlug;
      let counter = 1;
      while (await Post.findOne({ slug, _id: { $ne: id } })) {
        slug = `${baseSlug}-${counter++}`;
      }
      updates.slug = slug;
    }

    // Auto-update excerpt if content changed
    if (updates.content && !updates.excerpt) {
      updates.excerpt = updates.content.replace(/<[^>]*>/g, '').substring(0, 200).trim();
    }

    updates.updatedAt = new Date();

    const updated = await Post.findByIdAndUpdate(id, updates, { new: true })
      .populate("author", "name email avatar")
      .lean();

    if (!updated) {
      return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id.toString(),
        title: updated.title,
        content: updated.content,
        excerpt: updated.excerpt,
        author: (updated.author as any)?.name || 'Unknown',
        authorId: (updated.author as any)?._id?.toString() || '',
        tags: updated.tags,
        published: updated.published,
        slug: updated.slug,
        image: updated.image,
        views: updated.views,
        likes: updated.likes?.length || 0,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      message: updated.published ? "Post published successfully" : "Draft updated successfully"
    });
  } catch (error: any) {
    console.error("[UPDATE_POST_ERROR]", error);
    return NextResponse.json({ 
      error: error.code === 11000 ? "A post with this title already exists" : error.message || "Failed to update post" 
    }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    await connectToDatabase();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }
    if (post.author.toString() !== auth.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Soft delete by setting deleted flag and unpublishing
    await Post.findByIdAndUpdate(id, { 
      deleted: true, 
      published: false, 
      deletedAt: new Date() 
    });

    return NextResponse.json({
      success: true,
      message: "Post deleted successfully"
    });
  } catch (error: any) {
    console.error("[DELETE_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to delete post" }, { status: 500 });
  }
}
