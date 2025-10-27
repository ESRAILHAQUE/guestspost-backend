/**
 * Blog Service
 * Business logic for blog post-related operations
 */

import { BlogPost, IBlogPost } from "./blog.model";
import { AppError } from "@/utils/AppError";
import { logger } from "@/utils/logger";

export interface CreateBlogPostDto {
  title: string;
  content: string;
  excerpt?: string;
  author: string;
  authorId?: string;
  category: string;
  tags?: string[];
  image?: string;
  status?: "draft" | "published" | "archived";
}

export interface UpdateBlogPostDto {
  title?: string;
  content?: string;
  excerpt?: string;
  author?: string;
  authorId?: string;
  category?: string;
  tags?: string[];
  image?: string;
  status?: "draft" | "published" | "archived";
}

export interface BlogPostFilters {
  status?: string;
  category?: string;
  author?: string;
  authorId?: string;
  tags?: string[];
  search?: string;
  page?: number;
  limit?: number;
  publishedAfter?: Date;
  publishedBefore?: Date;
}

class BlogService {
  /**
   * Create a new blog post
   */
  async createBlogPost(data: CreateBlogPostDto): Promise<IBlogPost> {
    try {
      const blogPost = new BlogPost({
        ...data,
        status: data.status || "draft",
        views: 0,
      });

      await blogPost.save();

      logger.success(`Blog post created: ${blogPost.title}`);
      return blogPost;
    } catch (error: any) {
      logger.error("Error creating blog post:", error);
      throw new AppError("Failed to create blog post", 500);
    }
  }

  /**
   * Get all blog posts with filters
   */
  async getBlogPosts(filters: BlogPostFilters = {}): Promise<{
    blogPosts: IBlogPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const {
        status,
        category,
        author,
        authorId,
        tags,
        search,
        page = 1,
        limit = 20,
        publishedAfter,
        publishedBefore,
      } = filters;

      // Build query
      const query: any = {};

      if (status) query.status = status;
      if (category) query.category = category;
      if (author) query.author = author;
      if (authorId) query.authorId = authorId;

      // Tags filter
      if (tags && tags.length > 0) {
        query.tags = { $in: tags };
      }

      // Published date range filter
      if (publishedAfter || publishedBefore) {
        query.publishedAt = {};
        if (publishedAfter) query.publishedAt.$gte = publishedAfter;
        if (publishedBefore) query.publishedAt.$lte = publishedBefore;
      }

      // Text search
      if (search) {
        query.$text = { $search: search };
      }

      const skip = (page - 1) * limit;

      const [blogPosts, total] = await Promise.all([
        BlogPost.find(query)
          .populate("authorId", "user_nicename user_email")
          .sort({ publishedAt: -1, createdAt: -1 })
          .skip(skip)
          .limit(limit),
        BlogPost.countDocuments(query),
      ]);

      return {
        blogPosts,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      logger.error("Error fetching blog posts:", error);
      throw new AppError("Failed to fetch blog posts", 500);
    }
  }

  /**
   * Get published blog posts (for public access)
   */
  async getPublishedBlogPosts(
    filters: Omit<BlogPostFilters, "status"> = {}
  ): Promise<{
    blogPosts: IBlogPost[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    return this.getBlogPosts({ ...filters, status: "published" });
  }

  /**
   * Get blog post by ID
   */
  async getBlogPostById(id: string): Promise<IBlogPost> {
    try {
      const blogPost = await BlogPost.findById(id).populate(
        "authorId",
        "user_nicename user_email"
      );
      if (!blogPost) {
        throw new AppError("Blog post not found", 404);
      }
      return blogPost;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching blog post:", error);
      throw new AppError("Failed to fetch blog post", 500);
    }
  }

  /**
   * Get blog post by slug
   */
  async getBlogPostBySlug(slug: string): Promise<IBlogPost> {
    try {
      const blogPost = await BlogPost.findOne({ slug }).populate(
        "authorId",
        "user_nicename user_email"
      );
      if (!blogPost) {
        throw new AppError("Blog post not found", 404);
      }
      return blogPost;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching blog post by slug:", error);
      throw new AppError("Failed to fetch blog post", 500);
    }
  }

  /**
   * Update blog post
   */
  async updateBlogPost(
    id: string,
    data: UpdateBlogPostDto
  ): Promise<IBlogPost> {
    try {
      const blogPost = await BlogPost.findByIdAndUpdate(
        id,
        { ...data, updatedAt: new Date() },
        { new: true, runValidators: true }
      );

      if (!blogPost) {
        throw new AppError("Blog post not found", 404);
      }

      logger.success(`Blog post updated: ${blogPost.title}`);
      return blogPost;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error updating blog post:", error);
      throw new AppError("Failed to update blog post", 500);
    }
  }

  /**
   * Delete blog post
   */
  async deleteBlogPost(id: string): Promise<void> {
    try {
      const blogPost = await BlogPost.findByIdAndDelete(id);
      if (!blogPost) {
        throw new AppError("Blog post not found", 404);
      }

      logger.success(`Blog post deleted: ${blogPost.title}`);
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error deleting blog post:", error);
      throw new AppError("Failed to delete blog post", 500);
    }
  }

  /**
   * Publish blog post
   */
  async publishBlogPost(id: string): Promise<IBlogPost> {
    try {
      const blogPost = await BlogPost.findByIdAndUpdate(
        id,
        {
          status: "published",
          publishedAt: new Date(),
          updatedAt: new Date(),
        },
        { new: true, runValidators: true }
      );

      if (!blogPost) {
        throw new AppError("Blog post not found", 404);
      }

      logger.success(`Blog post published: ${blogPost.title}`);
      return blogPost;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error publishing blog post:", error);
      throw new AppError("Failed to publish blog post", 500);
    }
  }

  /**
   * Increment blog post views
   */
  async incrementViews(id: string): Promise<IBlogPost> {
    try {
      const blogPost = await BlogPost.findByIdAndUpdate(
        id,
        { $inc: { views: 1 } },
        { new: true }
      );

      if (!blogPost) {
        throw new AppError("Blog post not found", 404);
      }

      return blogPost;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error incrementing blog post views:", error);
      throw new AppError("Failed to increment views", 500);
    }
  }

  /**
   * Get blog post statistics
   */
  async getBlogPostStats(authorId?: string): Promise<{
    total: number;
    published: number;
    draft: number;
    archived: number;
    totalViews: number;
    averageViews: number;
    byCategory: Record<string, number>;
  }> {
    try {
      const query = authorId ? { authorId } : {};

      const [total, published, draft, archived, viewsData, categoryStats] =
        await Promise.all([
          BlogPost.countDocuments(query),
          BlogPost.countDocuments({ ...query, status: "published" }),
          BlogPost.countDocuments({ ...query, status: "draft" }),
          BlogPost.countDocuments({ ...query, status: "archived" }),
          BlogPost.aggregate([
            { $match: query },
            {
              $group: {
                _id: null,
                totalViews: { $sum: "$views" },
                averageViews: { $avg: "$views" },
              },
            },
          ]),
          BlogPost.aggregate([
            { $match: query },
            { $group: { _id: "$category", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
          ]),
        ]);

      const totalViews = viewsData[0]?.totalViews || 0;
      const averageViews = viewsData[0]?.averageViews || 0;

      const byCategory = categoryStats.reduce(
        (acc: Record<string, number>, stat: any) => {
          acc[stat._id] = stat.count;
          return acc;
        },
        {}
      );

      return {
        total,
        published,
        draft,
        archived,
        totalViews,
        averageViews,
        byCategory,
      };
    } catch (error: any) {
      logger.error("Error fetching blog post stats:", error);
      throw new AppError("Failed to fetch blog post statistics", 500);
    }
  }

  /**
   * Get categories
   */
  async getCategories(): Promise<string[]> {
    try {
      const categories = await BlogPost.distinct("category");
      return categories.sort();
    } catch (error: any) {
      logger.error("Error fetching categories:", error);
      throw new AppError("Failed to fetch categories", 500);
    }
  }

  /**
   * Get tags
   */
  async getTags(): Promise<string[]> {
    try {
      const tags = await BlogPost.distinct("tags");
      return tags.sort();
    } catch (error: any) {
      logger.error("Error fetching tags:", error);
      throw new AppError("Failed to fetch tags", 500);
    }
  }

  /**
   * Get related blog posts
   */
  async getRelatedBlogPosts(
    id: string,
    limit: number = 5
  ): Promise<IBlogPost[]> {
    try {
      const blogPost = await BlogPost.findById(id);
      if (!blogPost) {
        throw new AppError("Blog post not found", 404);
      }

      const relatedPosts = await BlogPost.find({
        _id: { $ne: id },
        status: "published",
        $or: [
          { category: blogPost.category },
          { tags: { $in: blogPost.tags } },
        ],
      })
        .sort({ publishedAt: -1 })
        .limit(limit);

      return relatedPosts;
    } catch (error: any) {
      if (error instanceof AppError) throw error;
      logger.error("Error fetching related blog posts:", error);
      throw new AppError("Failed to fetch related blog posts", 500);
    }
  }
}

export const blogService = new BlogService();
