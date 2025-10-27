/**
 * Blog Routes
 * API routes for blog post management
 */

import { Router } from "express";
import {
  createBlogPost,
  getBlogPosts,
  getPublishedBlogPosts,
  getBlogPostById,
  getBlogPostBySlug,
  updateBlogPost,
  deleteBlogPost,
  publishBlogPost,
  getBlogPostStats,
  getCategories,
  getTags,
  getRelatedBlogPosts,
} from "./blog.controller";
import { protect, authorize } from "@/middlewares";
import { validate } from "@/middlewares/validation.middleware";
import { body, param } from "express-validator";

const router = Router();

// Validation rules
const createBlogPostValidation = [
  body("title").trim().notEmpty().withMessage("Title is required"),
  body("content").trim().notEmpty().withMessage("Content is required"),
  body("author").trim().notEmpty().withMessage("Author is required"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Invalid status"),
];

const updateBlogPostValidation = [
  param("id").isMongoId().withMessage("Invalid blog post ID"),
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("content")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Content cannot be empty"),
  body("status")
    .optional()
    .isIn(["draft", "published", "archived"])
    .withMessage("Invalid status"),
];

const blogPostIdValidation = [
  param("id").isMongoId().withMessage("Invalid blog post ID"),
];

const blogPostSlugValidation = [
  param("slug").trim().notEmpty().withMessage("Slug is required"),
];

// Public routes
router.get("/published", getPublishedBlogPosts);
router.get("/categories", getCategories);
router.get("/tags", getTags);
router.get("/stats", getBlogPostStats);
router.get("/slug/:slug", validate(blogPostSlugValidation), getBlogPostBySlug);
router.get("/:id/related", validate(blogPostIdValidation), getRelatedBlogPosts);
router.get("/:id", validate(blogPostIdValidation), getBlogPostById);

// Protected routes (User and Admin)
router.get("/", protect, getBlogPosts);
router.post("/", protect, validate(createBlogPostValidation), createBlogPost);
router.put("/:id", protect, validate(updateBlogPostValidation), updateBlogPost);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(blogPostIdValidation),
  deleteBlogPost
);

// Admin only routes
router.patch(
  "/:id/publish",
  protect,
  authorize("admin"),
  validate(blogPostIdValidation),
  publishBlogPost
);

export { router as blogRoutes };
