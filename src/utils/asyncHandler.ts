/**
 * Async Handler Utility
 * Wraps async route handlers to catch errors and pass them to error middleware
 */

import { Request, Response, NextFunction, RequestHandler } from "express";

/**
 * Async Handler - Wraps async functions and catches any errors
 * @param fn - Async function to wrap
 * @returns Express RequestHandler
 */
export const asyncHandler = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
): RequestHandler => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

/**
 * Alternative async handler using try-catch (more explicit)
 */
export const catchAsync = (
  fn: (req: Request, res: Response, next: NextFunction) => Promise<any>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await fn(req, res, next);
    } catch (error) {
      next(error);
    }
  };
};

export default asyncHandler;
