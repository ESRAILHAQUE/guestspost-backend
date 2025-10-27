import mongoose, { Document, Schema } from "mongoose";

export interface ISiteSubmission extends Document {
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  websites: string[];
  isOwner: boolean;
  csvFile?: {
    name: string;
    data: string;
    type: string;
  };
  status: "pending" | "approved" | "rejected";
  submittedAt: Date;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  adminNotes?: string;
}

const siteSubmissionSchema = new Schema<ISiteSubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    websites: [{
      type: String,
      required: true,
      trim: true,
    }],
    isOwner: {
      type: Boolean,
      default: false,
    },
    csvFile: {
      name: String,
      data: String,
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    reviewedAt: Date,
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (_doc, ret) {
        const { __v, _id, ...rest } = ret;
        return {
          id: _id,
          ...rest,
        };
      },
    },
  }
);

export const SiteSubmission = mongoose.model<ISiteSubmission>(
  "SiteSubmission",
  siteSubmissionSchema
);
