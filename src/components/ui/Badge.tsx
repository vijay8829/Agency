"use client";
import { cn } from "@/lib/utils";

type BadgeVariant = "default" | "success" | "warning" | "danger" | "purple" | "outline" | "blue";

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
  dot?: boolean;
  pulse?: boolean;
}

const variants: Record<BadgeVariant, string> = {
  default:  "bg-[rgba(0,212,255,0.06)] text-[#7df4ff] border border-[rgba(0,212,255,0.14)]",
  success:  "bg-[rgba(0,255,157,0.07)] text-[#00ff9d] border border-[rgba(0,255,157,0.18)]",
  warning:  "bg-[rgba(245,166,35,0.09)] text-[#f5a623] border border-[rgba(245,166,35,0.20)]",
  danger:   "bg-[rgba(255,51,102,0.09)] text-[#ff7099] border border-[rgba(255,51,102,0.20)]",
  purple:   "bg-[rgba(139,92,246,0.09)] text-[#c4b5fd] border border-[rgba(139,92,246,0.22)]",
  outline:  "bg-transparent text-[rgba(0,212,255,0.6)] border border-[rgba(0,212,255,0.16)]",
  blue:     "bg-[rgba(0,212,255,0.07)] text-[#00d4ff] border border-[rgba(0,212,255,0.18)]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-[#00d4ff]", success: "bg-[#00ff9d]", warning: "bg-[#f5a623]",
  danger:  "bg-[#ff3366]", purple:  "bg-[#8b5cf6]", outline: "bg-[rgba(0,212,255,0.6)]",
  blue:    "bg-[#00d4ff]",
};

export function Badge({ children, variant = "default", className, dot, pulse }: BadgeProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold tracking-wide",
      variants[variant],
      className
    )}>
      {dot && (
        <span className={cn("w-1.5 h-1.5 rounded-full flex-shrink-0", dotColors[variant], pulse && "pulse-dot")} />
      )}
      {children}
    </span>
  );
}
