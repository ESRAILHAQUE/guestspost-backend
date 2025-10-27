/**
 * Routes Index
 * Central router configuration with modular structure
 */

import { Router } from "express";
import { authRoutes } from "@/modules/auth";
import { userRoutes } from "@/modules/user";
import { websiteRoutes } from "@/modules/website/website.routes";
import { orderRoutes } from "@/modules/order/order.routes";
import { fundRequestRoutes } from "@/modules/fundRequest/fundRequest.routes";
import { blogRoutes } from "@/modules/blog/blog.routes";
import { siteSubmissionRoutes } from "@/modules/siteSubmission/siteSubmission.routes";
import { adminRoutes } from "@/modules/admin";
import { packageRoutes } from "@/modules/package/package.routes";
import { reviewRoutes } from "@/modules/review/review.routes";
import { activityRoutes } from "@/modules/activity/activity.routes";
import { messageRoutes } from "@/modules/message/message.routes";

const router = Router();

// Mount modular routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/websites", websiteRoutes);
router.use("/orders", orderRoutes);
router.use("/fund-requests", fundRequestRoutes);
router.use("/blog", blogRoutes);
router.use("/site-submissions", siteSubmissionRoutes);
router.use("/packages", packageRoutes);
router.use("/reviews", reviewRoutes);
router.use("/activities", activityRoutes);
router.use("/messages", messageRoutes);
router.use("/admin", adminRoutes);

// Health check route
router.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

export default router;
// Enhanced routes configuration
