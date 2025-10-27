/**
 * User Model
 * Mongoose schema and model for User collection
 */

import mongoose, { Document, Schema } from "mongoose";
import { hashPassword, comparePassword } from "@/utils/password.utils";

/**
 * User Interface
 */
export interface IUser extends Document {
  _id: mongoose.Types.ObjectId;
  user_nicename: string;
  user_email: string;
  user_pass: string;
  user_url?: string;
  balance: number;
  user_status: "active" | "inactive" | "suspended";
  role: "user" | "admin";
  avatar?: string;
  phone?: string;
  registration_date: Date;
  lastLogin?: Date;
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;

  // Instance methods
  comparePassword(candidatePassword: string): Promise<boolean>;
  generatePasswordResetToken(): string;
}

/**
 * User Schema
 */
const userSchema = new Schema<IUser>(
  {
    user_nicename: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      maxlength: [100, "Name cannot exceed 100 characters"],
    },
    user_email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please provide a valid email address",
      ],
    },
    user_pass: {
      type: String,
      required: [true, "Password is required"],
      minlength: [8, "Password must be at least 8 characters"],
      select: false, // Don't return password by default in queries
    },
    user_url: {
      type: String,
      trim: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: [0, "Balance cannot be negative"],
    },
    user_status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    avatar: {
      type: String,
      default: null,
    },
    phone: {
      type: String,
      trim: true,
    },
    registration_date: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: {
      type: String,
      select: false,
    },
    passwordResetToken: {
      type: String,
      select: false,
    },
    passwordResetExpires: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (_doc, ret) {
        // Remove sensitive fields from JSON output
        const {
          user_pass,
          __v,
          emailVerificationToken,
          passwordResetToken,
          passwordResetExpires,
          ...cleanRet
        } = ret;
        // Add ID field for compatibility with frontend
        return {
          ...cleanRet,
          ID: ret._id.toString(),
        };
      },
    },
    toObject: {
      virtuals: true,
    },
  }
);

/**
 * Pre-save middleware to hash password
 */
userSchema.pre("save", async function (next) {
  if (!this.isModified("user_pass")) {
    return next();
  }

  this.user_pass = await hashPassword(this.user_pass);
  next();
});

/**
 * Instance method to compare password
 */
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await comparePassword(candidatePassword, this.user_pass);
};

/**
 * Instance method to generate password reset token
 */
userSchema.methods.generatePasswordResetToken = function (): string {
  const resetToken = Math.random().toString(36).substring(2, 15);
  this.passwordResetToken = resetToken;
  this.passwordResetExpires = new Date(Date.now() + 3600000); // 1 hour
  return resetToken;
};

/**
 * Index for faster queries
 */
userSchema.index({ user_email: 1 });
userSchema.index({ user_status: 1 });
userSchema.index({ role: 1 });

/**
 * Export User Model
 */
export const User = mongoose.model<IUser>("User", userSchema);
