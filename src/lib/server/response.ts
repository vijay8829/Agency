import { NextResponse } from "next/server";
import { AppError } from "./errors";
import { ZodError } from "zod";

export function ok<T>(data: T, status = 200) {
  return NextResponse.json({ success: true, data }, { status });
}

export function created<T>(data: T) {
  return ok(data, 201);
}

export function noContent() {
  return new NextResponse(null, { status: 204 });
}

export function errorResponse(err: unknown): NextResponse {
  if (err instanceof AppError) {
    return NextResponse.json(
      { success: false, code: err.code, error: err.message, details: err.details ?? null },
      { status: err.statusCode },
    );
  }

  if (err instanceof ZodError) {
    return NextResponse.json(
      {
        success: false,
        code: "VALIDATION_ERROR",
        error: "Validation failed",
        details: err.issues.map(e => ({ path: e.path.map(String).join("."), message: e.message })),
      },
      { status: 422 },
    );
  }

  console.error("[API Error]", err);
  return NextResponse.json(
    { success: false, code: "INTERNAL_ERROR", error: "An unexpected error occurred" },
    { status: 500 },
  );
}

export function paginated<T>(
  items: T[],
  total: number,
  page: number,
  pageSize: number,
) {
  return ok({
    items,
    pagination: {
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      hasMore: page * pageSize < total,
    },
  });
}
