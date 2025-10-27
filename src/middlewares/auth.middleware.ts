/**
 * Authentication Middleware
 * Handles JWT token verification and user authentication
 */

import { Request, Response, NextFunction } from "express";
import { UnauthorizedError, ForbiddenError } from "@/utils/AppError";
import { verifyAccessToken } from "@/utils/jwt.utils";
import { User } from "@/modules/user/user.model";
import { JwtPayload } from "@/utils/jwt.utils";

/**
 * Extend Express Request type to include user
 */
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { _id: string };
    }
  }
}

/**
 * Protect middleware - Verify JWT token and attach user to request
 */
export const protect = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Get token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }
    // Also check cookies as fallback
    else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      throw new UnauthorizedError(
        "Not authorized to access this route. Please login."
      );
    }

    // Verify token
    const decoded = verifyAccessToken(token);

    // Check if user still exists
    const user = await User.findById(decoded.userId);
    if (!user) {
      throw new UnauthorizedError("User no longer exists");
    }

    // Check if user is active
    if (user.user_status !== "active") {
      throw new UnauthorizedError(
        "User account is inactive. Please contact support."
      );
    }

    // Attach user to request
    req.user = {
      ...decoded,
      _id: user._id.toString(),
    };

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Authorize middleware - Check if user has required role(s)
 */
export const authorize = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      return next(
        new UnauthorizedError(
          "Not authorized to access this route. Please login."
        )
      );
    }

    if (!roles.includes(req.user.role || "user")) {
      return next(
        new ForbiddenError(
          `User role '${req.user.role}' is not authorized to access this route`
        )
      );
    }

    next();
  };
};

/**
 * Optional authentication - Attach user if token exists, but don't require it
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (token) {
      const decoded = verifyAccessToken(token);
      const user = await User.findById(decoded.userId);

      if (user && user.user_status === "active") {
        req.user = {
          ...decoded,
          _id: user._id.toString(),
        };
      }
    }

    next();
  } catch (error) {
    // Don't fail if token is invalid, just continue without user
    next();
  }
};
