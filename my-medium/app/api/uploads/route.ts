import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/post";
import { authenticateRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const id = params.id;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid post id" }, { status: 400 });
    }

    const updates = await request.json();

    await connectToDatabase();

    updates.updatedAt = new Date();

    const updated = await Post.findByIdAndUpdate(id, updates, { new: true })
      .populate("author", "name email avatar")
      .lean();

    if (!updated)
      return NextResponse.json({ error: "Post not found" }, { status: 404 });

    return NextResponse.json({
      success: true,
      data: {
        id: updated._id.toString(),
        title: updated.title,
        content: updated.content,
        excerpt: updated.excerpt,
        author: updated.author?.name,
        authorId: updated.author?._id.toString(),
        tags: updated.tags,
        published: updated.published,
        slug: updated.slug,
        image: updated.image,
        views: updated.views,
        likes: updated.likes?.length || 0,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update post" }, { status: 500 });
  }
}
