import { Router } from "express";
import {
  createSiteSubmission,
  getSiteSubmissions,
  getSiteSubmissionById,
  updateSiteSubmission,
  deleteSiteSubmission,
  getSiteSubmissionStats,
  getSiteSubmissionsByUser,
} from "./siteSubmission.controller";
import { protect, authorize } from "@/middlewares";
import { validate } from "@/middlewares";
import { body, param } from "express-validator";

const router = Router();

// Validation middleware
const createSiteSubmissionValidation = [
  body("userId").notEmpty().withMessage("User ID is required"),
  body("userName").trim().notEmpty().withMessage("User name is required"),
  body("userEmail").isEmail().withMessage("Valid email is required"),
  body("websites")
    .isArray({ min: 1 })
    .withMessage("At least one website is required"),
  body("isOwner").isBoolean().withMessage("isOwner must be a boolean"),
];

const updateSiteSubmissionValidation = [
  body("status").optional().isIn(["pending", "approved", "rejected"]),
  body("adminNotes").optional().trim(),
  body("reviewedBy").optional().notEmpty(),
];

const idValidation = [
  param("id").isMongoId().withMessage("Invalid site submission ID"),
];

const userEmailValidation = [
  param("userEmail").isEmail().withMessage("Valid email is required"),
];

// Public routes (for site submissions)
router.post(
  "/",
  validate(createSiteSubmissionValidation),
  createSiteSubmission
);

// Protected routes - users can access their own submissions, admin can access all
router.use(protect);

// GET routes - allow users to access their own data
router.get("/", getSiteSubmissions);
router.get("/stats", getSiteSubmissionStats);

// Admin-only routes
router.use(authorize("admin"));

router.get(
  "/user/:userEmail",
  validate(userEmailValidation),
  getSiteSubmissionsByUser
);
router.get("/:id", validate(idValidation), getSiteSubmissionById);
router.put(
  "/:id",
  validate([...idValidation, ...updateSiteSubmissionValidation]),
  updateSiteSubmission
);
router.delete("/:id", validate(idValidation), deleteSiteSubmission);

export { router as siteSubmissionRoutes };
