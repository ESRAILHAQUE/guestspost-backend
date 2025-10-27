import { Router } from "express";
import {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  addReplyToMessage,
  deleteMessage,
  getMessageStats,
} from "./message.controller";
import { protect, authorize } from "@/middlewares/auth.middleware";

const router = Router();

// Protected routes - Admin only
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getMessages).post(createMessage);
router.route("/stats").get(getMessageStats);
router
  .route("/:id")
  .get(getMessageById)
  .put(updateMessage)
  .delete(deleteMessage);
router.route("/:id/reply").post(addReplyToMessage);

export { router as messageRoutes };
