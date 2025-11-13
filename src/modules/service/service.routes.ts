import { Router } from "express";
import {
  createService,
  getServices,
  getActiveServices,
  getService,
  updateService,
  deleteService,
} from "./service.controller";
import { protect } from "@/middlewares/auth.middleware";

const router = Router();

// Public routes
router.get("/active", getActiveServices);

// Admin routes (protected)
router.post("/", protect, createService);
router.get("/", protect, getServices);
router.get("/:id", protect, getService);
router.put("/:id", protect, updateService);
router.delete("/:id", protect, deleteService);

export default router;

