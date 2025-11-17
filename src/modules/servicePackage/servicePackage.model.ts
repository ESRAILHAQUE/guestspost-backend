import mongoose, { Document, Schema } from "mongoose";

export interface IServicePackage extends Document {
  serviceId: string; // e.g. "article-writing", "link-insertions"
  name: string;
  price: number;
  originalPrice: number;
  articles: string; // e.g. "3 Articles", "5 Link Insertions"
  features: string[];
  popular: boolean;
  description: string;
  status: "active" | "inactive";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const servicePackageSchema = new Schema<IServicePackage>(
  {
    serviceId: {
      type: String,
      required: [true, "Service ID is required"],
      trim: true,
    },
    name: {
      type: String,
      required: [true, "Package name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
    },
    originalPrice: {
      type: Number,
      required: [true, "Original price is required"],
    },
    articles: {
      type: String,
      required: [true, "Articles/quantity description is required"],
      trim: true,
    },
    features: {
      type: [String],
      required: [true, "Features are required"],
    },
    popular: {
      type: Boolean,
      default: false,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
servicePackageSchema.index({ serviceId: 1, status: 1, order: 1 });

export const ServicePackage = mongoose.model<IServicePackage>(
  "ServicePackage",
  servicePackageSchema
);


