import { Router } from "express";
import {
  getMessages,
  getMessageById,
  createMessage,
  updateMessage,
  addReplyToMessage,
  deleteMessage,
  getMessageStats,
  getMyMessages,
  messageStream,
} from "./message.controller";
import { protect, authorize } from "@/middlewares/auth.middleware";

const router = Router();

// User routes - Get own messages
router.route("/me").get(protect, getMyMessages);
// SSE endpoint for real-time message updates (token in query param for SSE compatibility)
router.route("/stream").get(messageStream);

// Protected routes for message creation/updates (users can create and update their own messages)
router.route("/").post(protect, createMessage);
router.route("/:id").put(protect, updateMessage); // Users can update their own messages

// Admin only routes
router.use(protect);
router.use(authorize("admin"));

router.route("/").get(getMessages);
router.route("/stats").get(getMessageStats);
router
  .route("/:id")
  .get(getMessageById)
  .delete(deleteMessage);
router.route("/:id/reply").post(protect, addReplyToMessage);

export { router as messageRoutes };
