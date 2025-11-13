import { Router } from "express";
import {
  createServicePackage,
  getServicePackages,
  getActiveServicePackagesGrouped,
  getServicePackage,
  updateServicePackage,
  deleteServicePackage,
} from "./servicePackage.controller";
import { protect } from "@/middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/grouped", getActiveServicePackagesGrouped);

// Admin routes (protected)
router.post("/", protect, createServicePackage);
router.get("/", protect, getServicePackages);
router.get("/:id", protect, getServicePackage);
router.put("/:id", protect, updateServicePackage);
router.delete("/:id", protect, deleteServicePackage);

export default router;

