import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

export async function GET() {
  const provider = process.env.STORAGE_PROVIDER ?? "local";

  if (provider === "local") {
    // In serverless environments (Netlify, Vercel) the filesystem is read-only — skip write probe
    const isServerless = process.env.NETLIFY === "true" || process.env.VERCEL === "1";
    if (isServerless) {
      return NextResponse.json({
        status: "ok",
        provider: "local",
        note: "Serverless environment — filesystem write probe skipped",
        timestamp: new Date().toISOString(),
      });
    }
    try {
      const dir = process.env.LOCAL_UPLOAD_DIR ?? "./uploads";
      await fs.mkdir(dir, { recursive: true });
      const testKey = path.join(dir, ".health-probe");
      await fs.writeFile(testKey, "ok");
      await fs.unlink(testKey);

      return NextResponse.json({
        status: "ok",
        provider: "local",
        directory: dir,
        timestamp: new Date().toISOString(),
      });
    } catch (err) {
      return NextResponse.json({
        status: "error",
        provider: "local",
        error: err instanceof Error ? err.message : "Storage write failed",
        timestamp: new Date().toISOString(),
      }, { status: 503 });
    }
  }

  // S3/R2: just report configured (actual probe requires credentials)
  return NextResponse.json({
    status: "ok",
    provider,
    baseUrl: process.env.STORAGE_BASE_URL ?? "(not configured)",
    note: "Live connectivity probe requires credentials — configure STORAGE_BASE_URL to enable.",
    timestamp: new Date().toISOString(),
  });
}
