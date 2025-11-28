import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/post";
import User from "@/lib/models/user";
import mongoose from "mongoose";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    
    if (!slug) {
      return NextResponse.json({ error: "Slug is required" }, { status: 400 });
    }

    await connectToDatabase();
    
    // Ensure User model is registered
    User;

    // Try to find by slug first, then by ID if it's a valid ObjectId
    let query: any = { slug, published: true, deleted: { $ne: true } };
    
    // If slug looks like an ObjectId, also try finding by ID
    if (mongoose.Types.ObjectId.isValid(slug)) {
      query = {
        $or: [
          { slug, published: true, deleted: { $ne: true } },
          { _id: new mongoose.Types.ObjectId(slug), published: true, deleted: { $ne: true } }
        ]
      };
    }

    const post = await Post.findOne(query)
      .populate("author", "name email avatar")
      .lean();

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    const formatted = {
      id: post._id.toString(),
      title: post.title,
      content: post.content,
      excerpt: post.excerpt,
      author: (post.author as any)?.name || 'Unknown',
      authorId: (post.author as any)?._id?.toString() || '',
      tags: post.tags,
      published: post.published,
      slug: post.slug,
      image: post.image,
      views: post.views,
      likes: post.likes?.length || 0,
      comments: 0, // TODO: Add actual comment count
      createdAt: post.createdAt,
      updatedAt: post.updatedAt,
    };

    return NextResponse.json({
      success: true,
      data: formatted,
    });
  } catch (error) {
    console.error("[GET_POST_BY_SLUG_ERROR]", error);
    return NextResponse.json({ error: "Failed to fetch post" }, { status: 500 });
  }
}