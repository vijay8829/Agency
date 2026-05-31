import { PrismaClient } from "@prisma/client";
// Validate env vars at startup — will warn in dev, crash in production if missing
import "@/lib/server/env";

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
}

// Singleton to prevent multiple connections in dev hot-reload
export const db: PrismaClient =
  globalThis.__prisma ?? (globalThis.__prisma = createPrismaClient());

if (process.env.NODE_ENV !== "production") {
  globalThis.__prisma = db;
}
