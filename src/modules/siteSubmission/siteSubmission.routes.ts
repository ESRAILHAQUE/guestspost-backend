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
import { uploadCSV } from "@/middlewares/upload.middleware";

const router = Router();

// Validation middleware
const createSiteSubmissionValidation = [
  body("userId").optional(),
  body("userName").optional().trim(),
  body("publisherName").optional().trim(),
  body("userEmail").isEmail().withMessage("Valid email is required"),
  body("email").optional().isEmail().withMessage("Valid email is required"),
  body("websites")
    .custom((value) => {
      if (!value) return false;
      const websites = typeof value === "string" ? JSON.parse(value) : value;
      return Array.isArray(websites) && websites.length > 0;
    })
    .withMessage("At least one website is required"),
  body("isOwner").custom((value) => {
    if (value === "true" || value === true || value === "yes") return true;
    return false;
  }).withMessage("You must confirm that you are the owner"),
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
  uploadCSV, // Handle file upload
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
