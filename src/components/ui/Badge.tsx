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
  default:  "bg-white/[0.06] text-zinc-300 border border-white/[0.08]",
  success:  "bg-emerald-500/[0.1] text-emerald-400 border border-emerald-500/[0.18]",
  warning:  "bg-amber-500/[0.1] text-amber-400 border border-amber-500/[0.18]",
  danger:   "bg-red-500/[0.1] text-red-400 border border-red-500/[0.18]",
  purple:   "bg-violet-500/[0.1] text-violet-300 border border-violet-500/[0.2]",
  outline:  "bg-transparent text-zinc-400 border border-white/[0.1]",
  blue:     "bg-blue-500/[0.1] text-blue-400 border border-blue-500/[0.18]",
};

const dotColors: Record<BadgeVariant, string> = {
  default: "bg-zinc-400", success: "bg-emerald-400", warning: "bg-amber-400",
  danger: "bg-red-400",   purple: "bg-violet-400",   outline: "bg-zinc-400",
  blue: "bg-blue-400",
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
