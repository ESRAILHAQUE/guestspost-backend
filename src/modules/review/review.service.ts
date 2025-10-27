import { Review, IReview } from "./review.model";
import { CreateReviewDto, UpdateReviewDto } from "./review.dto";

export class ReviewService {
  async createReview(reviewData: CreateReviewDto): Promise<IReview> {
    const newReview = new Review(reviewData);
    return await newReview.save();
  }

  async getAllReviews(): Promise<IReview[]> {
    return await Review.find().sort({ createdAt: -1 });
  }

  async getReviewById(id: string): Promise<IReview | null> {
    return await Review.findById(id);
  }

  async updateReview(id: string, updateData: UpdateReviewDto): Promise<IReview | null> {
    return await Review.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });
  }

  async deleteReview(id: string): Promise<void> {
    await Review.findByIdAndDelete(id);
  }

  async getReviewStats() {
    const total = await Review.countDocuments();
    const avgRating = await Review.aggregate([
      { $group: { _id: null, avgRating: { $avg: "$rating" } } }
    ]);
    
    return {
      total,
      averageRating: avgRating[0]?.avgRating || 0,
    };
  }
}

export const reviewService = new ReviewService();
