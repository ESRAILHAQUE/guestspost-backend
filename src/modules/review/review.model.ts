import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
  name: string;
  company: string;
  rating: number;
  review: string;
  image?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Rating must be between 1 and 5"],
      max: [5, "Rating must be between 1 and 5"],
    },
    review: {
      type: String,
      required: [true, "Review text is required"],
    },
    image: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model<IReview>("Review", ReviewSchema);
// Enhanced review model
