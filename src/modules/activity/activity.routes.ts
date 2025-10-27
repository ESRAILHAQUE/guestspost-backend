import { Router } from "express";
import {
  getActivities,
  getActivitiesByType,
  getActivitiesByUser,
  getActivityStats,
} from "./activity.controller";
import { protect, authorize } from "@/middlewares/auth.middleware";

const router = Router();

// Protected routes - Admin only
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getActivities);
router.route("/stats").get(getActivityStats);
router.route("/type/:type").get(getActivitiesByType);
router.route("/user/:userId").get(getActivitiesByUser);

export { router as activityRoutes };
