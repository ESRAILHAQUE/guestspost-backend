import { Router } from "express";
import {
  createReview,
  getReviews,
  getReviewById,
  updateReview,
  deleteReview,
  getReviewStats,
} from "./review.controller";
import { protect, authorize } from "@/middlewares/auth.middleware";

const router = Router();

// Public routes - Get reviews
router.route("/").get(getReviews);

// Protected routes - Admin only
router.use(protect);
router.use(authorize("admin"));

router.route("/").post(createReview);
router.route("/stats").get(getReviewStats);
router
  .route("/:id")
  .get(getReviewById)
  .put(updateReview)
  .delete(deleteReview);

export { router as reviewRoutes };
