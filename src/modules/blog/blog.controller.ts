/**
 * Blog Controller
 * Handles HTTP requests for blog post management
 */

import { Request, Response, NextFunction } from "express";
import {
  blogService,
  CreateBlogPostDto,
  UpdateBlogPostDto,
  BlogPostFilters,
} from "./blog.service";
import { asyncHandler } from "@/middlewares";
import { ApiResponse } from "@/utils/apiResponse";

/**
 * Create a new blog post
 */
export const createBlogPost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const blogPostData: CreateBlogPostDto = req.body;

    const blogPost = await blogService.createBlogPost(blogPostData);

    ApiResponse.created(res, blogPost, "Blog post created successfully");
  }
);

/**
 * Get all blog posts with filters
 */
export const getBlogPosts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: BlogPostFilters = {
      status: req.query.status as string,
      category: req.query.category as string,
      author: req.query.author as string,
      authorId: req.query.authorId as string,
      tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      publishedAfter: req.query.publishedAfter
        ? new Date(req.query.publishedAfter as string)
        : undefined,
      publishedBefore: req.query.publishedBefore
        ? new Date(req.query.publishedBefore as string)
        : undefined,
    };

    const result = await blogService.getBlogPosts(filters);

    ApiResponse.paginated(
      res,
      result.blogPosts,
      result.page,
      result.limit,
      result.total,
      "Blog posts retrieved successfully"
    );
  }
);

/**
 * Get published blog posts (public access)
 */
export const getPublishedBlogPosts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const filters: Omit<BlogPostFilters, "status"> = {
      category: req.query.category as string,
      author: req.query.author as string,
      authorId: req.query.authorId as string,
      tags: req.query.tags ? (req.query.tags as string).split(",") : undefined,
      search: req.query.search as string,
      page: req.query.page ? Number(req.query.page) : 1,
      limit: req.query.limit ? Number(req.query.limit) : 20,
      publishedAfter: req.query.publishedAfter
        ? new Date(req.query.publishedAfter as string)
        : undefined,
      publishedBefore: req.query.publishedBefore
        ? new Date(req.query.publishedBefore as string)
        : undefined,
    };

    const result = await blogService.getPublishedBlogPosts(filters);

    ApiResponse.paginated(
      res,
      result.blogPosts,
      result.page,
      result.limit,
      result.total,
      "Published blog posts retrieved successfully"
    );
  }
);

/**
 * Get blog post by ID
 */
export const getBlogPostById = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const blogPost = await blogService.getBlogPostById(id);

    ApiResponse.success(res, blogPost, "Blog post retrieved successfully");
  }
);

/**
 * Get blog post by slug
 */
export const getBlogPostBySlug = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { slug } = req.params;

    const blogPost = await blogService.getBlogPostBySlug(slug);

    // Increment views for published posts
    if (blogPost.status === "published") {
      await blogService.incrementViews(blogPost._id.toString());
    }

    ApiResponse.success(res, blogPost, "Blog post retrieved successfully");
  }
);

/**
 * Update blog post
 */
export const updateBlogPost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const updateData: UpdateBlogPostDto = req.body;

    const blogPost = await blogService.updateBlogPost(id, updateData);

    ApiResponse.success(res, blogPost, "Blog post updated successfully");
  }
);

/**
 * Delete blog post
 */
export const deleteBlogPost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    await blogService.deleteBlogPost(id);

    ApiResponse.success(res, null, "Blog post deleted successfully");
  }
);

/**
 * Publish blog post
 */
export const publishBlogPost = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;

    const blogPost = await blogService.publishBlogPost(id);

    ApiResponse.success(res, blogPost, "Blog post published successfully");
  }
);

/**
 * Get blog post statistics
 */
export const getBlogPostStats = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const authorId = req.query.authorId as string;

    const stats = await blogService.getBlogPostStats(authorId);

    ApiResponse.success(
      res,
      stats,
      "Blog post statistics retrieved successfully"
    );
  }
);

/**
 * Get categories
 */
export const getCategories = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const categories = await blogService.getCategories();

    ApiResponse.success(res, categories, "Categories retrieved successfully");
  }
);

/**
 * Get tags
 */
export const getTags = asyncHandler(
  async (_req: Request, res: Response, _next: NextFunction) => {
    const tags = await blogService.getTags();

    ApiResponse.success(res, tags, "Tags retrieved successfully");
  }
);

/**
 * Get related blog posts
 */
export const getRelatedBlogPosts = asyncHandler(
  async (req: Request, res: Response, _next: NextFunction) => {
    const { id } = req.params;
    const limit = req.query.limit ? Number(req.query.limit) : 5;

    const relatedPosts = await blogService.getRelatedBlogPosts(id, limit);

    ApiResponse.success(
      res,
      relatedPosts,
      "Related blog posts retrieved successfully"
    );
  }
);
