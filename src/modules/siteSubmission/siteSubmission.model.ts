import mongoose, { Document, Schema } from "mongoose";

export interface ISiteSubmission extends Document {
  userId?: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  websites: string[];
  isOwner: boolean;
  publisherName?: string;
  country?: string;
  phone?: string;
  message?: string;
  siteDescription?: string;
  monthlyTraffic?: string;
  domainAuthority?: string;
  domainRating?: string;
  websiteOwner?: string;
  csvFile?: {
    fileName: string;
    filePath: string; // Path on VPS
    fileSize?: number;
    mimeType?: string;
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
      required: false,
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
    siteDescription: {
      type: String,
      trim: true,
    },
    monthlyTraffic: {
      type: String,
      trim: true,
    },
    domainAuthority: {
      type: String,
      trim: true,
    },
    domainRating: {
      type: String,
      trim: true,
    },
    websiteOwner: {
      type: String,
      trim: true,
    },
    publisherName: {
      type: String,
      trim: true,
    },
    country: {
      type: String,
      trim: true,
    },
    phone: {
      type: String,
      trim: true,
    },
    message: {
      type: String,
      trim: true,
    },
    csvFile: {
      type: Schema.Types.Mixed,
      required: false,
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
