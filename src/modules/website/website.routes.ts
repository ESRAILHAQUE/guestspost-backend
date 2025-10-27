/**
 * Website Routes
 * API routes for website management
 */

import { Router } from "express";
import {
  createWebsite,
  getWebsites,
  getWebsiteById,
  updateWebsite,
  deleteWebsite,
  getWebsiteStats,
  getCategories,
  getNiches,
} from "./website.controller";
import { protect, authorize } from "@/middlewares";
import { validate } from "@/middlewares/validation.middleware";
import { body, param } from "express-validator";

const router = Router();

// Validation rules
const createWebsiteValidation = [
  body("name").trim().notEmpty().withMessage("Website name is required"),
  body("url").isURL().withMessage("Please provide a valid URL"),
  body("category").trim().notEmpty().withMessage("Category is required"),
  body("niche").trim().notEmpty().withMessage("Niche is required"),
  body("da").isNumeric().withMessage("DA must be a number"),
  body("dr").isNumeric().withMessage("DR must be a number"),
  body("traffic")
    .trim()
    .notEmpty()
    .withMessage("Traffic information is required"),
  body("country").trim().notEmpty().withMessage("Country is required"),
  body("delivery").trim().notEmpty().withMessage("Delivery time is required"),
  body("doFollowPrice")
    .isNumeric()
    .withMessage("DoFollow price must be a number"),
  body("noFollowPrice")
    .isNumeric()
    .withMessage("NoFollow price must be a number"),
];

const updateWebsiteValidation = [
  param("id").isMongoId().withMessage("Invalid website ID"),
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Website name cannot be empty"),
  body("url").optional().isURL().withMessage("Please provide a valid URL"),
  body("da").optional().isNumeric().withMessage("DA must be a number"),
  body("dr").optional().isNumeric().withMessage("DR must be a number"),
  body("doFollowPrice")
    .optional()
    .isNumeric()
    .withMessage("DoFollow price must be a number"),
  body("noFollowPrice")
    .optional()
    .isNumeric()
    .withMessage("NoFollow price must be a number"),
];

const websiteIdValidation = [
  param("id").isMongoId().withMessage("Invalid website ID"),
];

// Public routes
router.get("/", getWebsites);
router.get("/categories", getCategories);
router.get("/niches", getNiches);
router.get("/stats", getWebsiteStats);
router.get("/:id", validate(websiteIdValidation), getWebsiteById);

// Protected routes (Admin only)
router.post(
  "/",
  protect,
  authorize("admin"),
  validate(createWebsiteValidation),
  createWebsite
);
router.put(
  "/:id",
  protect,
  authorize("admin"),
  validate(updateWebsiteValidation),
  updateWebsite
);
router.delete(
  "/:id",
  protect,
  authorize("admin"),
  validate(websiteIdValidation),
  deleteWebsite
);

export { router as websiteRoutes };
