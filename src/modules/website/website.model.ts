/**
 * Website Model
 * Mongoose schema and model for Website collection
 */

import mongoose, { Document, Schema } from "mongoose";

/**
 * Website Interface
 */
export interface IWebsite extends Document {
  _id: mongoose.Types.ObjectId;
  name: string;
  url: string;
  category: string;
  niche: string;
  section: "standard" | "premium";
  da: number;
  dr: number;
  traffic: string;
  language: string;
  country: string;
  status: "active" | "pending" | "inactive";
  delivery: string;
  doFollowPrice: number;
  noFollowPrice: number;
  standardPrice?: number;
  premiumDoFollowPrice?: number;
  premiumNoFollowPrice?: number;
  description?: string;
  guidelines?: string;
  logo?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Website Schema
 */
const websiteSchema = new Schema<IWebsite>(
  {
    name: {
      type: String,
      required: [true, "Website name is required"],
      trim: true,
      maxlength: [200, "Website name cannot exceed 200 characters"],
    },
    url: {
      type: String,
      required: [true, "Website URL is required"],
      trim: true,
      match: [
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
        "Please provide a valid URL",
      ],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      trim: true,
    },
    niche: {
      type: String,
      required: [true, "Niche is required"],
      trim: true,
    },
    section: {
      type: String,
      enum: ["standard", "premium"],
      default: "standard",
    },
    da: {
      type: Number,
      required: [true, "Domain Authority (DA) is required"],
      min: [0, "DA must be between 0 and 100"],
      max: [100, "DA must be between 0 and 100"],
    },
    dr: {
      type: Number,
      required: [true, "Domain Rating (DR) is required"],
      min: [0, "DR must be between 0 and 100"],
      max: [100, "DR must be between 0 and 100"],
    },
    traffic: {
      type: String,
      required: [true, "Traffic information is required"],
      trim: true,
    },
    language: {
      type: String,
      required: [true, "Language is required"],
      default: "English",
      trim: true,
    },
    country: {
      type: String,
      required: [true, "Country is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "pending", "inactive"],
      default: "pending",
    },
    delivery: {
      type: String,
      required: [true, "Delivery time is required"],
      trim: true,
    },
    doFollowPrice: {
      type: Number,
      required: [true, "DoFollow price is required"],
      min: [0, "Price cannot be negative"],
    },
    noFollowPrice: {
      type: Number,
      required: [true, "NoFollow price is required"],
      min: [0, "Price cannot be negative"],
    },
    standardPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    premiumDoFollowPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    premiumNoFollowPrice: {
      type: Number,
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, "Description cannot exceed 2000 characters"],
    },
    guidelines: {
      type: String,
      trim: true,
      maxlength: [5000, "Guidelines cannot exceed 5000 characters"],
    },
    logo: {
      type: String,
      trim: true,
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
websiteSchema.index({ status: 1 });
websiteSchema.index({ category: 1 });
websiteSchema.index({ niche: 1 });
websiteSchema.index({ section: 1 });
websiteSchema.index({ da: -1 });
websiteSchema.index({ dr: -1 });
websiteSchema.index({ name: "text", description: "text" }); // Text search

/**
 * Export Website Model
 */
export const Website = mongoose.model<IWebsite>("Website", websiteSchema);
