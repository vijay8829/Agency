/**
 * File upload validation and storage backend.
 * Local filesystem in dev, S3/R2-compatible in production via STORAGE_PROVIDER.
 */

import path from "path";
import fs from "fs/promises";

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml",
  "application/pdf",
  "application/msword", "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "text/plain", "text/csv",
  "application/zip",
]);

const MAX_FILE_SIZE_BYTES = parseInt(process.env.MAX_FILE_SIZE_MB ?? "25", 10) * 1024 * 1024;

// Bytes that indicate common dangerous file types (magic bytes)
const DANGEROUS_MAGIC: Array<{ bytes: number[]; label: string }> = [
  { bytes: [0x4D, 0x5A], label: "Windows PE executable" },           // MZ
  { bytes: [0x7F, 0x45, 0x4C, 0x46], label: "ELF executable" },     // ELF
  { bytes: [0xCA, 0xFE, 0xBA, 0xBE], label: "Mach-O executable" },   // Mach-O
];

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export function validateFile(file: { name: string; type: string; size: number }, firstBytes?: Uint8Array): FileValidationResult {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return { valid: false, error: `File type '${file.type}' is not allowed.` };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: `File exceeds maximum size of ${MAX_FILE_SIZE_BYTES / 1024 / 1024}MB.` };
  }

  const ext = path.extname(file.name).toLowerCase();
  const dangerousExtensions = [".exe", ".bat", ".cmd", ".sh", ".ps1", ".dll", ".so", ".dylib", ".php", ".py", ".rb", ".js"];
  if (dangerousExtensions.includes(ext)) {
    return { valid: false, error: `File extension '${ext}' is not allowed.` };
  }

  if (firstBytes) {
    for (const { bytes, label } of DANGEROUS_MAGIC) {
      if (bytes.every((b, i) => firstBytes[i] === b)) {
        return { valid: false, error: `File appears to be a ${label}.` };
      }
    }
  }

  return { valid: true };
}

// Plan-based upload quotas
export const PLAN_STORAGE_LIMITS: Record<string, number> = {
  starter: 1 * 1024 * 1024 * 1024,   // 1GB
  pro: 10 * 1024 * 1024 * 1024,       // 10GB
  agency: 100 * 1024 * 1024 * 1024,   // 100GB
};

export function generateStorageKey(orgId: string, filename: string): string {
  const ext = path.extname(filename);
  const random = Math.random().toString(36).slice(2, 10);
  const ts = Date.now().toString(36);
  return `orgs/${orgId}/files/${ts}-${random}${ext}`;
}

// ─── Local storage backend ────────────────────────────────────────────────────

const LOCAL_UPLOAD_DIR = process.env.LOCAL_UPLOAD_DIR ?? /* turbopackIgnore: true */ "./uploads";

export const storage = {
  async write(key: string, data: Buffer | Uint8Array): Promise<void> {
    const full = path.join(LOCAL_UPLOAD_DIR, key);
    await fs.mkdir(path.dirname(full), { recursive: true });
    await fs.writeFile(full, data);
  },

  async read(key: string): Promise<Buffer> {
    return fs.readFile(path.join(LOCAL_UPLOAD_DIR, key));
  },

  async delete(key: string): Promise<void> {
    try {
      await fs.unlink(path.join(LOCAL_UPLOAD_DIR, key));
    } catch {
      // File may already be gone
    }
  },

  // In production with S3/R2, this returns a pre-signed URL.
  // Locally, returns a proxied route URL.
  getUrl(key: string, _expiresIn = 3600): string {
    if (process.env.STORAGE_PROVIDER === "s3" || process.env.STORAGE_PROVIDER === "r2") {
      // TODO: sign with AWS SDK or Cloudflare R2 SDK
      return `${process.env.STORAGE_BASE_URL ?? ""}/${key}`;
    }
    return `/api/files/serve?key=${encodeURIComponent(key)}`;
  },

  async exists(key: string): Promise<boolean> {
    try {
      await fs.access(path.join(LOCAL_UPLOAD_DIR, key));
      return true;
    } catch {
      return false;
    }
  },
};
