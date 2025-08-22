import { NextFunction, Request, Response } from "express";
import { ApiResponse } from "../utils/ApiResponse";
import { ZodError } from "zod";

interface CustomError extends Error {
    status?: number;
    details?: any;
}

export function ErrorHandler(
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    console.error("Error caught:", err);

    // Handle Zod validation errors
    if (err instanceof ZodError) {
        const formatted_error = err.issues.map(issue => ({
            field: issue.path.join(" "), //field is type of aray thats why i used join
            message: issue.message,
        }))
        return ApiResponse(res, false, 400, "Validation failed", {
            errors: formatted_error
        });
    }

    // Default error handler
    const status = err.status || 500;
    const message = err.message || "Internal Server Error";

    return ApiResponse(res, false, status, message, {
        errors: err.details || null,
    });
}
