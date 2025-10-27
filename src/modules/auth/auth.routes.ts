/**
 * Authentication Routes
 * Routes for user authentication
 */

import { Router } from "express";
import { body } from "express-validator";
import {
  register,
  login,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
  refreshToken,
} from "./auth.controller";
import { protect } from "@/middlewares/auth.middleware";
import { validate } from "@/middlewares/validation.middleware";

const router = Router();

/**
 * Register validation
 */
const registerValidation = [
  body("user_nicename")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 100 })
    .withMessage("Name must not exceed 100 characters"),
  body("user_email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("user_pass")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

/**
 * Login validation
 */
const loginValidation = [
  body("user_email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("user_pass").trim().notEmpty().withMessage("Password is required"),
];

/**
 * Forgot password validation
 */
const forgotPasswordValidation = [
  body("user_email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
];

/**
 * Reset password validation
 */
const resetPasswordValidation = [
  body("token").trim().notEmpty().withMessage("Reset token is required"),
  body("user_pass")
    .trim()
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
];

/**
 * Change password validation
 */
const changePasswordValidation = [
  body("currentPassword")
    .trim()
    .notEmpty()
    .withMessage("Current password is required"),
  body("newPassword")
    .trim()
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 8 })
    .withMessage("New password must be at least 8 characters long"),
];

/**
 * Refresh token validation
 */
const refreshTokenValidation = [
  body("refreshToken")
    .trim()
    .notEmpty()
    .withMessage("Refresh token is required"),
];

// Routes
router.post("/register", validate(registerValidation), register);
router.post("/login", validate(loginValidation), login);
router.post("/logout", protect, logout);
router.get("/me", protect, getMe);
router.post(
  "/forgot-password",
  validate(forgotPasswordValidation),
  forgotPassword
);
router.post(
  "/reset-password",
  validate(resetPasswordValidation),
  resetPassword
);
router.post(
  "/change-password",
  protect,
  validate(changePasswordValidation),
  changePassword
);
router.post("/refresh-token", validate(refreshTokenValidation), refreshToken);

export default router;
