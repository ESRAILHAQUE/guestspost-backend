export interface CreateReviewDto {
  name: string;
  company: string;
  rating: number;
  review: string;
  image?: string;
}

export interface UpdateReviewDto {
  name?: string;
  company?: string;
  rating?: number;
  review?: string;
  image?: string;
}
