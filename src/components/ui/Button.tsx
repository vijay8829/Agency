"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger" | "outline" | "success" | "ai" | "billing";
type Size = "xs" | "sm" | "md" | "lg" | "xl";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-violet-600 hover:bg-violet-500 active:bg-violet-700 text-white border border-violet-500/40 " +
    "shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_0_24px_rgba(124,58,237,0.18)] " +
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.12)_inset,0_0_32px_rgba(124,58,237,0.28)]",
  secondary:
    "bg-white/[0.05] hover:bg-white/[0.09] active:bg-white/[0.04] " +
    "text-zinc-200 border border-white/[0.08] hover:border-white/[0.16]",
  ghost:
    "bg-transparent hover:bg-white/[0.06] active:bg-white/[0.04] " +
    "text-zinc-400 hover:text-zinc-200 border border-transparent",
  danger:
    "bg-red-500/[0.08] hover:bg-red-500/[0.16] active:bg-red-500/[0.06] " +
    "text-red-400 border border-red-500/20 hover:border-red-500/35",
  outline:
    "bg-transparent hover:bg-white/[0.04] " +
    "text-zinc-300 border border-white/[0.1] hover:border-white/[0.2]",
  success:
    "bg-emerald-500/[0.1] hover:bg-emerald-500/[0.18] active:bg-emerald-500/[0.07] " +
    "text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/35",
  // AI actions — gradient, premium glow
  ai:
    "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 " +
    "active:from-violet-700 active:to-indigo-700 text-white border border-violet-500/30 " +
    "shadow-[0_0_24px_rgba(124,58,237,0.22)] hover:shadow-[0_0_36px_rgba(124,58,237,0.35)]",
  // Billing / payment actions — green CTA
  billing:
    "bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 " +
    "text-white border border-emerald-500/40 " +
    "shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_0_20px_rgba(16,185,129,0.14)] " +
    "hover:shadow-[0_1px_0_rgba(255,255,255,0.1)_inset,0_0_28px_rgba(16,185,129,0.24)]",
};

const sizes: Record<Size, string> = {
  xs:  "text-xs   px-2    py-1    h-7  gap-1",
  sm:  "text-xs   px-3    py-1.5  h-8  gap-1.5",
  md:  "text-sm   px-4    py-2    h-9  gap-2",
  lg:  "text-sm   px-5    py-2.5  h-11 gap-2",
  xl:  "text-base px-6    py-3    h-12 gap-2.5",
};

export function Button({
  variant = "secondary",
  size = "md",
  loading,
  icon,
  iconRight,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg font-medium",
        "transition-all duration-150 ease-out",
        "active:scale-[0.97]",
        "cursor-pointer select-none",
        "disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100 disabled:pointer-events-none",
        "focus-visible:outline-2 focus-visible:outline-violet-500 focus-visible:outline-offset-2",
        variants[variant],
        sizes[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <svg className="w-3.5 h-3.5 animate-spin flex-shrink-0" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-80" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      ) : icon && (
        <span className="flex-shrink-0 flex items-center">{icon}</span>
      )}
      {children && <span className="truncate">{children}</span>}
      {iconRight && !loading && (
        <span className="flex-shrink-0 flex items-center">{iconRight}</span>
      )}
    </button>
  );
}
