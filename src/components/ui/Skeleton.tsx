"use client";

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number;
  className?: string;
}

export function Skeleton({ width, height = 14, radius = 6 }: SkeletonProps) {
  return (
    <div
      className="shimmer"
      style={{ width: width ?? "100%", height, borderRadius: radius, flexShrink: 0 }}
    />
  );
}

export function SkeletonRow({ cols = 1 }: { cols?: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", borderRadius: 12, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.055)" }}>
      <Skeleton width={36} height={36} radius={10} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
        <Skeleton width="45%" height={12} />
        <Skeleton width="30%" height={10} />
      </div>
      {cols > 1 && <Skeleton width={60} height={12} radius={4} />}
      {cols > 2 && <Skeleton width={48} height={24} radius={7} />}
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div style={{ padding: "18px 20px", borderRadius: 14, background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.055)", display: "flex", flexDirection: "column", gap: 10 }}>
      <Skeleton width="40%" height={12} />
      <Skeleton width="60%" height={28} radius={4} />
      <Skeleton width="50%" height={10} />
    </div>
  );
}
