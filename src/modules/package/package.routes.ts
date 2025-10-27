/**
 * Package Routes
 * Routes for package management
 */

import { Router } from "express";
import {
  createPackage,
  getPackages,
  getPackageById,
  updatePackage,
  deletePackage,
  getPackageStats,
} from "./package.controller";
import { protect, authorize } from "@/middlewares/auth.middleware";

const router = Router();

// Public routes - Get active packages
router.route("/active").get(getPackages);

// Protected routes - Admin only
router.use(protect);
router.use(authorize("admin"));

router.route("/").post(createPackage).get(getPackages);
router.route("/stats").get(getPackageStats);
router
  .route("/:id")
  .get(getPackageById)
  .put(updatePackage)
  .delete(deletePackage);

export { router as packageRoutes };
