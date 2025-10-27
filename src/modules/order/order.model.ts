/**
 * Order Model
 * Mongoose schema and model for Order collection
 */

import mongoose, { Document, Schema } from "mongoose";

/**
 * Order Interface
 */
export interface IOrder extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  user_id: string; // For frontend compatibility
  userName: string;
  userEmail: string;
  item_name: string;
  price: number;
  status: "processing" | "completed" | "failed" | "pending";
  type: string;
  description?: string;
  features?: string[];
  article?: string;
  file?: {
    name: string;
    type: string;
    size: number;
    data: string;
  };
  message?: string;
  message_time?: Date;
  submittedAt?: Date;
  completionMessage?: string;
  completionLink?: string;
  completedAt?: Date;
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Order Schema
 */
const orderSchema = new Schema<IOrder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    user_id: {
      type: String,
      required: [true, "User email is required"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
      trim: true,
    },
    userEmail: {
      type: String,
      required: [true, "User email is required"],
      trim: true,
      lowercase: true,
    },
    item_name: {
      type: String,
      required: [true, "Item name is required"],
      trim: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["processing", "completed", "failed", "pending"],
      default: "pending",
    },
    type: {
      type: String,
      required: [true, "Order type is required"],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [5000, "Description cannot exceed 5000 characters"],
    },
    features: {
      type: [String],
      default: [],
    },
    article: {
      type: String,
      trim: true,
    },
    file: {
      name: String,
      type: String,
      size: Number,
      data: String,
    },
    message: {
      type: String,
      trim: true,
    },
    message_time: {
      type: Date,
    },
    submittedAt: {
      type: Date,
    },
    completionMessage: {
      type: String,
      trim: true,
    },
    completionLink: {
      type: String,
      trim: true,
    },
    completedAt: {
      type: Date,
    },
    date: {
      type: Date,
      default: Date.now,
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
          created_at: ret.createdAt,
          orderDate: ret.date,
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
orderSchema.index({ userId: 1 });
orderSchema.index({ user_id: 1 });
orderSchema.index({ userEmail: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ date: -1 });
orderSchema.index({ createdAt: -1 });

/**
 * Pre-save middleware
 */
orderSchema.pre("save", function (next) {
  // Ensure user_id is set from userEmail if not provided
  if (!this.user_id && this.userEmail) {
    this.user_id = this.userEmail;
  }
  next();
});

/**
 * Export Order Model
 */
export const Order = mongoose.model<IOrder>("Order", orderSchema);
