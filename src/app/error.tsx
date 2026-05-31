"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    const isChunk =
      error?.name === "ChunkLoadError" ||
      error?.message?.includes("Failed to load chunk") ||
      error?.message?.includes("502");

    if (isChunk) {
      window.location.reload();
    }
  }, [error]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#050509",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 12,
        color: "#71717a",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        className="spin"
        style={{
          width: 32,
          height: 32,
          border: "2px solid rgba(124,58,237,0.3)",
          borderTopColor: "#7c3aed",
          borderRadius: "50%",
        }}
      />
      <p style={{ fontSize: 13, marginTop: 4 }}>Reconnecting…</p>
      <button
        onClick={reset}
        style={{ marginTop: 4, fontSize: 12, color: "#a78bfa", background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.25)", borderRadius: 8, padding: "6px 16px", cursor: "pointer" }}
      >
        Try again
      </button>
    </div>
  );
}
