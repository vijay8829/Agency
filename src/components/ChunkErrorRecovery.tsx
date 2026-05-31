"use client";
import { useEffect } from "react";

function isChunkError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { name?: string; message?: string };
  return (
    e.name === "ChunkLoadError" ||
    (typeof e.message === "string" && e.message.includes("Failed to load chunk"))
  );
}

export function ChunkErrorRecovery() {
  useEffect(() => {
    // Catch chunk load failures from promise rejections (Turbopack async imports)
    const onUnhandledRejection = (ev: PromiseRejectionEvent) => {
      if (isChunkError(ev.reason)) {
        ev.preventDefault();
        window.location.reload();
      }
    };

    // Catch chunk load failures from sync script errors
    const onError = (ev: ErrorEvent) => {
      if (isChunkError(ev.error)) {
        ev.preventDefault();
        window.location.reload();
      }
    };

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    window.addEventListener("error", onError);

    return () => {
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
      window.removeEventListener("error", onError);
    };
  }, []);

  return null;
}
