/**
 * Authentication Service
 * Business logic for authentication operations
 */

import { User } from "@/modules/user/user.model";
import { generateTokens } from "@/utils/jwt.utils";
import {
  BadRequestError,
  UnauthorizedError,
  ConflictError,
} from "@/utils/AppError";
import { validatePasswordStrength } from "@/utils/password.utils";
import { sendVerificationEmail } from "@/utils/email.utils";
import { config } from "@/config/env.config";

interface RegisterDto {
  user_nicename: string;
  user_email: string;
  user_pass: string;
}

interface LoginDto {
  user_email: string;
  user_pass: string;
}

interface ForgotPasswordDto {
  user_email: string;
}

interface ResetPasswordDto {
  token: string;
  user_pass: string;
}

interface ChangePasswordDto {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterDto) {
    const { user_nicename, user_email, user_pass } = data;

    // Check if user already exists
    const existingUser = await User.findOne({ user_email });
    if (existingUser) {
      throw new ConflictError("User with this email already exists");
    }

    // Validate password strength
    const passwordValidation = validatePasswordStrength(user_pass);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    // Create user
    const user = await User.create({
      user_nicename,
      user_email,
      user_pass,
      registration_date: new Date(),
    });

    // Generate email verification token
    const verificationToken = user.generateEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    try {
      await sendVerificationEmail({
        userEmail: user.user_email,
        userName: user.user_nicename,
        verificationToken,
        frontendUrl: config.app.frontendUrl,
      });
    } catch (error) {
      console.error("Failed to send verification email:", error);
      // Don't fail registration if email fails
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.user_email,
      role: user.role,
    });

    return {
      user: {
        ID: user._id.toString(),
        user_nicename: user.user_nicename,
        user_email: user.user_email,
        balance: user.balance,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      tokens,
    };
  }

  /**
   * Login user
   */
  async login(data: LoginDto) {
    const { user_email, user_pass } = data;

    // Check if email and password provided
    if (!user_email || !user_pass) {
      throw new BadRequestError("Please provide email and password");
    }

    // Find user and include password
    const user = await User.findOne({ user_email }).select("+user_pass");
    if (!user) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if password matches
    const isPasswordMatch = await user.comparePassword(user_pass);
    if (!isPasswordMatch) {
      throw new UnauthorizedError("Invalid credentials");
    }

    // Check if user is active
    if (user.user_status !== "active") {
      throw new UnauthorizedError(
        "Your account is inactive. Please contact support."
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.user_email,
      role: user.role,
    });

    return {
      user: {
        ID: user._id.toString(),
        user_nicename: user.user_nicename,
        user_email: user.user_email,
        balance: user.balance,
        role: user.role,
      },
      tokens,
    };
  }

  /**
   * Get current user profile
   */
  async getMe(userId: string) {
    // Use lean() to get plain JavaScript object, or toObject() to ensure proper serialization
    const user = await User.findById(userId).lean();

    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Debug: Log balance to see what's in the database
    console.log("getMe - User balance from DB:", user.balance);
    console.log("getMe - Balance type:", typeof user.balance);
    console.log("getMe - Full user object keys:", Object.keys(user));

    // Ensure balance is a number, default to 0 if undefined/null
    // Access balance directly from the user object
    const balance = (user.balance !== undefined && user.balance !== null) 
      ? Number(user.balance) 
      : 0;

    console.log("getMe - Final balance being returned:", balance);

    return {
      ID: user._id.toString(),
      user_nicename: user.user_nicename,
      user_email: user.user_email,
      balance: balance,
      role: user.role,
      user_status: user.user_status,
      registration_date: user.registration_date,
    };
  }

  /**
   * Forgot password - send reset token
   */
  async forgotPassword(data: ForgotPasswordDto) {
    const { user_email } = data;

    const user = await User.findOne({ user_email });
    if (!user) {
      // Don't reveal if email exists or not for security
      return { message: "If email exists, reset link has been sent" };
    }

    // Generate reset token
    const resetToken = user.generatePasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // TODO: Send email with reset token
    // For now, we'll return the token (in production, send via email)
    console.log(`Password reset token for ${user_email}: ${resetToken}`);

    return { message: "If email exists, reset link has been sent" };
  }

  /**
   * Reset password with token
   */
  async resetPassword(data: ResetPasswordDto) {
    const { token, user_pass } = data;

    // Validate password strength
    const passwordValidation = validatePasswordStrength(user_pass);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    // Find user by reset token
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      throw new BadRequestError("Invalid or expired reset token");
    }

    // Update password
    user.user_pass = user_pass;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    return { message: "Password reset successful" };
  }

  /**
   * Change password (for logged in users)
   */
  async changePassword(userId: string, data: ChangePasswordDto) {
    const { currentPassword, newPassword } = data;

    // Find user with password
    const user = await User.findById(userId).select("+user_pass");
    if (!user) {
      throw new UnauthorizedError("User not found");
    }

    // Check current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new BadRequestError("Current password is incorrect");
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.valid) {
      throw new BadRequestError(passwordValidation.errors.join(", "));
    }

    // Update password
    user.user_pass = newPassword;
    await user.save();

    return { message: "Password changed successfully" };
  }

  /**
   * Google OAuth signup/login
   */
  async googleAuth(googleData: {
    email: string;
    name: string;
    googleId: string;
    picture?: string;
  }) {
    const { email, name, googleId, picture } = googleData;

    // Check if user already exists
    let user = await User.findOne({ user_email: email });

    if (user) {
      // User exists, update last login
      user.lastLogin = new Date();
      // If email not verified, mark as verified for Google users
      if (!user.isEmailVerified) {
        user.isEmailVerified = true;
      }
      await user.save();
    } else {
      // Create new user
      user = await User.create({
        user_nicename: name,
        user_email: email,
        user_pass: googleId, // Use googleId as password (will be hashed)
        registration_date: new Date(),
        isEmailVerified: true, // Google emails are pre-verified
        avatar: picture,
        lastLogin: new Date(),
      });
    }

    // Generate tokens
    const tokens = generateTokens({
      userId: user._id.toString(),
      email: user.user_email,
      role: user.role,
    });

    return {
      user: {
        ID: user._id.toString(),
        user_nicename: user.user_nicename,
        user_email: user.user_email,
        balance: user.balance,
        role: user.role,
        isEmailVerified: user.isEmailVerified,
      },
      tokens,
    };
  }

  /**
   * Verify email address
   */
  async verifyEmail(token: string) {
    // Find user by verification token
    const user = await User.findOne({
      emailVerificationToken: token,
    }).select("+emailVerificationToken");

    if (!user) {
      throw new BadRequestError("Invalid or expired verification token");
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    return { message: "Email verified successfully" };
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string) {
    const { verifyRefreshToken } = await import("@/utils/jwt.utils");

    try {
      const decoded = verifyRefreshToken(refreshToken);

      // Find user
      const user = await User.findById(decoded.userId);
      if (!user) {
        throw new UnauthorizedError("User not found");
      }

      // Generate new tokens
      const tokens = generateTokens({
        userId: user._id.toString(),
        email: user.user_email,
        role: user.role,
      });

      return {
        user: {
          ID: user._id.toString(),
          user_nicename: user.user_nicename,
          user_email: user.user_email,
          balance: user.balance,
          role: user.role,
        },
        tokens,
      };
    } catch (error) {
      throw new UnauthorizedError("Invalid refresh token");
    }
  }
}

export const authService = new AuthService();
