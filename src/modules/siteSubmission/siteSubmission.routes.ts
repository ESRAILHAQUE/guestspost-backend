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
  body("userEmail")
    .optional()
    .isEmail()
    .withMessage("Valid email is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Valid email is required")
    .custom((value, { req }) => {
      // If userEmail is not set, use email as userEmail
      if (!req.body.userEmail && value) {
        req.body.userEmail = value;
      }
      return true;
    }),
  body().custom((body) => {
    // Ensure at least one email field is provided
    if (!body.userEmail && !body.email) {
      throw new Error("Valid email is required (userEmail or email)");
    }
    return true;
  }),
  body("websites")
    .custom((value) => {
      if (!value) {
        throw new Error("At least one website is required");
      }
      try {
        const websites = typeof value === "string" ? JSON.parse(value) : value;
        if (!Array.isArray(websites) || websites.length === 0) {
          throw new Error("At least one website is required");
        }
        return true;
      } catch (error) {
        throw new Error("Invalid websites format");
      }
    }),
  body("isOwner")
    .custom((value) => {
      const isOwnerValue = value === "true" || value === true || value === "yes" || value === "Yes";
      if (!isOwnerValue) {
        throw new Error("You must confirm that you are the owner");
      }
      return true;
    }),
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
