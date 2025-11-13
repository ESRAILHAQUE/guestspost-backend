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

// Public routes - No authentication required

router.route("/").get(getPackages);
router.route("/active").get(getPackages);
router.route("/:id").get(getPackageById);

// Protected routes - Admin only
router.use(protect);
router.use(authorize("admin"));

router.route("/").post(createPackage);
router.route("/stats").get(getPackageStats);
router.route("/:id").put(updatePackage).delete(deletePackage);

export { router as packageRoutes };
