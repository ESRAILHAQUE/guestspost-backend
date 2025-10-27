/**
 * Package Model
 * Mongoose schema for packages/pricing plans
 */

import mongoose, { Schema, Document } from "mongoose";

export interface IPackage extends Document {
  name: string;
  price: number;
  description: string;
  features: string[];
  popular?: boolean;
  offer?: boolean;
  status: "active" | "inactive";
  createdAt: Date;
  updatedAt: Date;
}

const PackageSchema = new Schema<IPackage>(
  {
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Package price is required"],
      min: [0, "Price cannot be negative"],
    },
    description: {
      type: String,
      required: [true, "Package description is required"],
    },
    features: {
      type: [String],
      default: [],
    },
    popular: {
      type: Boolean,
      default: false,
    },
    offer: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

export const Package = mongoose.model<IPackage>("Package", PackageSchema);
