/**
 * Admin Routes
 * Routes for admin dashboard operations
 */

import { Router } from "express";
import { protect, authorize } from "@/middlewares/auth.middleware";
import { getAdminStats, getSystemHealth, getActivityLogs } from "./admin.controller";

const router = Router();

// All admin routes require authentication and admin role
router.use(protect);
router.use(authorize("admin"));

// Admin dashboard routes
router.get("/stats", getAdminStats);
router.get("/health", getSystemHealth);
router.get("/activities", getActivityLogs);

export { router as adminRoutes };
