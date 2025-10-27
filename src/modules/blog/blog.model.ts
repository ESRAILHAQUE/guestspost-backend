/**
 * BlogPost Model
 * Mongoose schema and model for BlogPost collection
 */

import mongoose, { Document, Schema } from "mongoose";

/**
 * BlogPost Interface
 */
export interface IBlogPost extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  author: string;
  authorId?: mongoose.Types.ObjectId;
  category: string;
  tags?: string[];
  image?: string;
  status: "draft" | "published" | "archived";
  views: number;
  publishedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * BlogPost Schema
 */
const blogPostSchema = new Schema<IBlogPost>(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    slug: {
      type: String,
      required: [true, "Slug is required"],
      unique: true,
      trim: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: [true, "Content is required"],
    },
    excerpt: {
      type: String,
      trim: true,
      maxlength: [500, "Excerpt cannot exceed 500 characters"],
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
    },
    authorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    tags: {
      type: [String],
      default: [],
    },
    image: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ["draft", "published", "archived"],
      default: "draft",
    },
    views: {
      type: Number,
      default: 0,
      min: [0, "Views cannot be negative"],
    },
    publishedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        const { __v, ...cleanRet } = ret;
        // Add id field for compatibility with frontend
        return {
          ...cleanRet,
          id: ret._id.toString(),
        };
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

/**
 * Indexes for faster queries
 */
blogPostSchema.index({ slug: 1 });
blogPostSchema.index({ status: 1 });
blogPostSchema.index({ category: 1 });
blogPostSchema.index({ tags: 1 });
blogPostSchema.index({ publishedAt: -1 });
blogPostSchema.index({ title: "text", content: "text", excerpt: "text" }); // Text search

/**
 * Pre-save middleware to auto-generate slug from title
 */
blogPostSchema.pre("save", function (next) {
  if (this.isModified("title") && !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  }

  // Set publishedAt when status changes to published
  if (
    this.isModified("status") &&
    this.status === "published" &&
    !this.publishedAt
  ) {
    this.publishedAt = new Date();
  }

  next();
});

/**
 * Export BlogPost Model
 */
export const BlogPost = mongoose.model<IBlogPost>("BlogPost", blogPostSchema);
