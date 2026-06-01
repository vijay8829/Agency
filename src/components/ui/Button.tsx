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
  /* Electric cyan — primary CTA */
  primary:
    "bg-gradient-to-r from-[#00d4ff] to-[#06b6d4] hover:from-[#33ddff] hover:to-[#22c8e8] " +
    "active:from-[#00b8e0] active:to-[#0599bc] text-[#020510] font-semibold border border-[#00d4ff]/40 " +
    "shadow-[0_0_20px_rgba(0,212,255,0.22),0_1px_0_rgba(255,255,255,0.15)_inset] " +
    "hover:shadow-[0_0_32px_rgba(0,212,255,0.35),0_1px_0_rgba(255,255,255,0.15)_inset]",
  /* Subtle glass — secondary */
  secondary:
    "bg-[rgba(0,212,255,0.05)] hover:bg-[rgba(0,212,255,0.09)] active:bg-[rgba(0,212,255,0.04)] " +
    "text-zinc-200 border border-[rgba(0,212,255,0.12)] hover:border-[rgba(0,212,255,0.22)]",
  /* Ghost / minimal */
  ghost:
    "bg-transparent hover:bg-[rgba(0,212,255,0.06)] active:bg-[rgba(0,212,255,0.04)] " +
    "text-zinc-400 hover:text-zinc-200 border border-transparent hover:border-[rgba(0,212,255,0.10)]",
  /* Danger — hot pink */
  danger:
    "bg-[rgba(255,51,102,0.08)] hover:bg-[rgba(255,51,102,0.16)] active:bg-[rgba(255,51,102,0.06)] " +
    "text-[#ff7099] border border-[rgba(255,51,102,0.20)] hover:border-[rgba(255,51,102,0.35)]",
  /* Outline */
  outline:
    "bg-transparent hover:bg-[rgba(0,212,255,0.04)] " +
    "text-zinc-300 border border-[rgba(0,212,255,0.14)] hover:border-[rgba(0,212,255,0.28)]",
  /* Success — neon mint */
  success:
    "bg-[rgba(0,255,157,0.08)] hover:bg-[rgba(0,255,157,0.16)] active:bg-[rgba(0,255,157,0.06)] " +
    "text-[#00ff9d] border border-[rgba(0,255,157,0.20)] hover:border-[rgba(0,255,157,0.35)]",
  /* AI — violet gradient, deep glow */
  ai:
    "bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] hover:from-[#9d72ff] hover:to-[#7c3aed] " +
    "active:from-[#7c4fe0] active:to-[#5b21b6] text-white border border-[rgba(139,92,246,0.35)] " +
    "shadow-[0_0_24px_rgba(139,92,246,0.25)] hover:shadow-[0_0_36px_rgba(139,92,246,0.38)]",
  /* Billing — neon green CTA */
  billing:
    "bg-[#00ff9d] hover:bg-[#33ffb0] active:bg-[#00e88d] " +
    "text-[#020510] font-semibold border border-[rgba(0,255,157,0.5)] " +
    "shadow-[0_0_20px_rgba(0,255,157,0.22)] hover:shadow-[0_0_32px_rgba(0,255,157,0.35)]",
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
