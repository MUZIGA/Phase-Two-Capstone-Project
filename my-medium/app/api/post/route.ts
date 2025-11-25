
import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/db";
import Post from "@/lib/models/post";
import { authenticateRequest } from "@/lib/auth";
import mongoose from "mongoose";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const tag = searchParams.get("tag");
    const authorId = searchParams.get("authorId");
    const published = searchParams.get("published");
    const limit = 10;
    const skip = (page - 1) * limit;

    await connectToDatabase();

    const query: any = {};
    if (!published) query.published = true;
    else query.published = published === "true";

    if (tag) query.tags = { $in: [tag] };

    if (authorId) {
      if (!mongoose.Types.ObjectId.isValid(authorId)) {
        return NextResponse.json({ error: "Invalid authorId" }, { status: 400 });
      }
      query.author = new mongoose.Types.ObjectId(authorId);
    }

    const [posts, total] = await Promise.all([
      Post.find(query)
        .populate("author", "name email avatar")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Post.countDocuments(query),
    ]);

    const formatted = posts.map((p: any) => ({
      id: p._id.toString(),
      title: p.title,
      content: p.content,
      excerpt: p.excerpt,
      author: p.author.name,
      authorId: p.author._id.toString(),
      tags: p.tags,
      published: p.published,
      slug: p.slug,
      image: p.image,
      views: p.views,
      likes: p.likes?.length || 0,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return NextResponse.json({
      success: true,
      data: formatted,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (e) {
    console.error("[GET_POSTS_ERROR]", e);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authenticateRequest(request);
    if (!auth) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await request.json();
    const { title, content, excerpt, tags, published = false, image } = body;

    if (!title || !content) {
      return NextResponse.json({ error: "Title and content are required" }, { status: 400 });
    }

    await connectToDatabase();

    // Generate unique slug
    const baseSlug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    let slug = baseSlug;
    let counter = 1;
    while (await Post.findOne({ slug })) {
      slug = `${baseSlug}-${counter++}`;
    }

    // Create the draft or post
    const post = await Post.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200),
      author: auth.userId,
      tags: tags || [],
      published, // false for draft
      slug,
      image,
      views: 0,
      likes: [],
    });

    const populated = await Post.findById(post._id).populate("author", "name email avatar").lean();

    return NextResponse.json(
      {
        success: true,
        data: {
          id: populated!._id.toString(),
          title: populated!.title,
          content: populated!.content,
          excerpt: populated!.excerpt,
          author: (populated!.author as any).name,
          authorId: (populated!.author as any)._id.toString(),
          tags: populated!.tags,
          published: populated!.published,
          slug: populated!.slug,
          image: populated!.image,
          views: populated!.views,
          likes: populated!.likes?.length || 0,
          createdAt: populated!.createdAt,
          updatedAt: populated!.updatedAt,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[CREATE_POST_ERROR]", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
