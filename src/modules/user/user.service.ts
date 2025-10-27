/**
 * User Service
 * Business logic for user operations
 */

import { User } from "./user.model";
import { NotFoundError } from "@/utils/AppError";

class UserService {
  /**
   * Get all users
   */
  async getAllUsers() {
    const users = await User.find().select("-user_pass");
    return users;
  }

  /**
   * Get single user by ID
   */
  async getUserById(userId: string) {
    const user = await User.findById(userId).select("-user_pass");
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  /**
   * Update user
   */
  async updateUser(userId: string, updateData: any) {
    const user = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-user_pass");

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  /**
   * Delete user
   */
  async deleteUser(userId: string) {
    const user = await User.findByIdAndDelete(userId);

    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    const user = await User.findOne({ user_email: email }).select("-user_pass");
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    return user;
  }

  /**
   * Update user balance
   */
  async updateBalance(userId: string, amount: number) {
    const user = await User.findById(userId);
    
    if (!user) {
      throw new NotFoundError("User not found");
    }

    user.balance = amount;
    await user.save();

    return user;
  }
}

export const userService = new UserService();

