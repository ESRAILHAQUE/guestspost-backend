/**
 * User Routes
 * Routes for user management
 */

import { Router } from "express";
import {
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  getCurrentUser,
} from "./user.controller";
import { protect, authorize } from "@/middlewares/auth.middleware";

const router = Router();

// All routes require authentication
router.use(protect);

// Get current user (me)
router.route("/me").get(getCurrentUser);

router.route("/").get(authorize("admin"), getUsers);

router
  .route("/:id")
  .get(getUser)
  .put(updateUser)
  .delete(authorize("admin"), deleteUser);

export default router;
