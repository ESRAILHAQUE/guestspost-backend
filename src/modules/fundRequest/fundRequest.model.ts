/**
 * FundRequest Model
 * Mongoose schema and model for FundRequest collection
 */

import mongoose, { Document, Schema } from "mongoose";

/**
 * FundRequest Interface
 */
export interface IFundRequest extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  amount: number;
  paypalEmail?: string;
  status: "pending" | "invoice-sent" | "paid" | "rejected";
  requestDate: Date;
  notes?: string;
  adminNotes?: string;
  processedDate?: Date;
  processedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * FundRequest Schema
 */
const fundRequestSchema = new Schema<IFundRequest>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
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
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: [1, "Amount must be at least $1"],
    },
    paypalEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },
    status: {
      type: String,
      enum: ["pending", "invoice-sent", "paid", "rejected"],
      default: "pending",
    },
    requestDate: {
      type: Date,
      default: Date.now,
    },
    notes: {
      type: String,
      trim: true,
      maxlength: [1000, "Notes cannot exceed 1000 characters"],
    },
    adminNotes: {
      type: String,
      trim: true,
      maxlength: [1000, "Admin notes cannot exceed 1000 characters"],
    },
    processedDate: {
      type: Date,
    },
    processedBy: {
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
fundRequestSchema.index({ userId: 1 });
fundRequestSchema.index({ userEmail: 1 });
fundRequestSchema.index({ status: 1 });
fundRequestSchema.index({ requestDate: -1 });

/**
 * Pre-save middleware to update processedDate when status changes
 */
fundRequestSchema.pre("save", function (next) {
  if (
    this.isModified("status") &&
    (this.status === "paid" || this.status === "rejected")
  ) {
    if (!this.processedDate) {
      this.processedDate = new Date();
    }
  }
  next();
});

/**
 * Export FundRequest Model
 */
export const FundRequest = mongoose.model<IFundRequest>(
  "FundRequest",
  fundRequestSchema
);
