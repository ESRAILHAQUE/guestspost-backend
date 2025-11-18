/**
 * Validation Middleware
 * Express validator middleware for request validation
 */

import { Request, Response, NextFunction } from "express";
import { validationResult, ValidationChain } from "express-validator";
import { ValidationError } from "@/utils/AppError";

/**
 * Validate request using express-validator
 */
export const validate = (validations: ValidationChain[]) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    // Format errors
    const extractedErrors: { [key: string]: string }[] = [];
    errors.array().forEach((err: any) => {
      const field = err.path || err.param || err.location;
      extractedErrors.push({ [field]: err.msg });
    });

    // Log validation errors for debugging
    console.error("Validation errors:", extractedErrors);

    // Throw validation error with details
    const errorMessage = `Validation failed: ${extractedErrors.map(e => Object.entries(e).map(([k, v]) => `${k}: ${v}`).join(", ")).join("; ")}`;
    return next(new ValidationError(errorMessage, req.originalUrl));
  };
};

/**
 * Sanitize request body - Remove unwanted fields
 */
export const sanitize = (allowedFields: string[]) => {
  return (req: Request, _res: Response, next: NextFunction) => {
    const sanitized: any = {};

    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        sanitized[field] = req.body[field];
      }
    });

    req.body = sanitized;
    next();
  };
};
