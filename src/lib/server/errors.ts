export class AppError extends Error {
  constructor(
    public readonly code: string,
    public readonly message: string,
    public readonly statusCode: number = 400,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const Err = {
  unauthorized: (msg = "Unauthorized") =>
    new AppError("UNAUTHORIZED", msg, 401),

  forbidden: (msg = "Forbidden") =>
    new AppError("FORBIDDEN", msg, 403),

  notFound: (msg = "Resource not found") =>
    new AppError("NOT_FOUND", msg, 404),

  conflict: (msg: string) =>
    new AppError("CONFLICT", msg, 409),

  validation: (msg: string, details?: unknown) =>
    new AppError("VALIDATION_ERROR", msg, 422, details),

  rateLimit: () =>
    new AppError("RATE_LIMITED", "Too many requests. Please slow down.", 429),

  internal: (msg = "Internal server error") =>
    new AppError("INTERNAL_ERROR", msg, 500),
};
