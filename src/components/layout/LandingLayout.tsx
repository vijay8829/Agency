"use client";
import React from "react";

const LANDING_BG = "#050509";

export function LandingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        background: LANDING_BG,
        minHeight: "100vh",
        width: "100%",
        color: "#f4f4f6",
        fontFamily: "Inter, -apple-system, BlinkMacSystemFont, sans-serif",
        /* Ensure this div's background always wins over body */
        isolation: "isolate",
        position: "relative",
      }}
    >
      {children}
    </div>
  );
}
