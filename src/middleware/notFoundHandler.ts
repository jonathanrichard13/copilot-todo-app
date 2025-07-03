import { Request, Response } from "express";
import { ApiErrorResponse } from "../models/ApiResponse";

/**
 * 404 Not Found handler middleware
 */
export const notFoundHandler = (req: Request, res: Response): void => {
  const errorResponse: ApiErrorResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`,
    errorCode: 'NOT_FOUND',
    timestamp: new Date(),
  };

  res.status(404).json(errorResponse);
};
