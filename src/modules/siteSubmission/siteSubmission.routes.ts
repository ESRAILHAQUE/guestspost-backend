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
  body().custom((body, { req }) => {
    // Ensure at least one email field is provided
    const userEmail = body.userEmail || req.body.userEmail;
    const email = body.email || req.body.email;
    if (!userEmail && !email) {
      throw new Error("Valid email is required (userEmail or email)");
    }
    // Set userEmail if not present but email is
    if (!req.body.userEmail && email) {
      req.body.userEmail = email;
    }
    return true;
  }),
  body("websites")
    .custom((value, { req }) => {
      const websitesValue = value || req.body.websites;
      if (!websitesValue) {
        throw new Error("At least one website is required");
      }
      try {
        const websites = typeof websitesValue === "string" ? JSON.parse(websitesValue) : websitesValue;
        if (!Array.isArray(websites) || websites.length === 0) {
          throw new Error("At least one website is required");
        }
        return true;
      } catch (error) {
        throw new Error("Invalid websites format");
      }
    }),
  body("isOwner")
    .custom((value, { req }) => {
      const isOwnerValue = value || req.body.isOwner;
      const isOwner = isOwnerValue === "true" || isOwnerValue === true || isOwnerValue === "yes" || isOwnerValue === "Yes";
      if (!isOwner) {
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
  uploadCSV, // Handle file upload (multer parses FormData)
  (req, _res, next) => {
    // Debug: Log what multer parsed
    console.log("After multer - req.body:", JSON.stringify(req.body, null, 2));
    console.log("After multer - req.files:", req.files ? req.files.map((f: any) => ({ name: f.originalname, fieldname: f.fieldname })) : null);
    console.log("After multer - Content-Type:", req.headers["content-type"]);
    
    // Extract CSV file from files array
    if (req.files && Array.isArray(req.files)) {
      const csvFile = req.files.find((f: any) => f.fieldname === "csvFile");
      if (csvFile) {
        (req as any).file = csvFile;
      }
    }
    
    // Ensure fields are strings (multer might return them as strings)
    if (req.body.userEmail && typeof req.body.userEmail !== "string") {
      req.body.userEmail = String(req.body.userEmail);
    }
    if (req.body.email && typeof req.body.email !== "string") {
      req.body.email = String(req.body.email);
    }
    if (req.body.websites && typeof req.body.websites !== "string") {
      req.body.websites = typeof req.body.websites === "object" 
        ? JSON.stringify(req.body.websites) 
        : String(req.body.websites);
    }
    if (req.body.isOwner !== undefined) {
      req.body.isOwner = String(req.body.isOwner);
    }
    
    next();
  },
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
