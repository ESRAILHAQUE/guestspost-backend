import mongoose, { Document, Schema } from "mongoose";

export interface IService extends Document {
  title: string;
  description: string;
  icon: string;
  status: "active" | "inactive";
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const serviceSchema = new Schema<IService>(
  {
    title: {
      type: String,
      required: [true, "Service title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Service description is required"],
      trim: true,
    },
    icon: {
      type: String,
      default: "CheckCircle",
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
serviceSchema.index({ status: 1, order: 1 });

export const Service = mongoose.model<IService>("Service", serviceSchema);

