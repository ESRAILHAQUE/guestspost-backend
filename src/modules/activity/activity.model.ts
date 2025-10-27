import mongoose, { Schema, Document } from "mongoose";

export interface IActivity extends Document {
  userId?: string;
  userName?: string;
  type:
    | "order"
    | "user"
    | "website"
    | "site_submission"
    | "fund_request"
    | "blog";
  action: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: {
      type: String,
    },
    userName: {
      type: String,
    },
    type: {
      type: String,
      enum: [
        "order",
        "user",
        "website",
        "site_submission",
        "fund_request",
        "blog",
      ],
      required: true,
    },
    action: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
ActivitySchema.index({ createdAt: -1 });
ActivitySchema.index({ type: 1, createdAt: -1 });

export const Activity = mongoose.model<IActivity>("Activity", ActivitySchema);
