import { clsx } from "clsx";
import type { ReactNode } from "react";

type BadgeVariant = "neutral" | "success" | "warning" | "danger";

const variantClasses: Record<BadgeVariant, string> = {
  neutral:
    "bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700",
  success:
    "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800",
  warning:
    "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-200 border-amber-200 dark:border-amber-800",
  danger:
    "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200 border-rose-200 dark:border-rose-800",
};

type BadgeProps = {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
};

export const Badge = ({
  children,
  variant = "neutral",
  className,
}: BadgeProps) => (
  <span
    className={clsx(
      "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium",
      variantClasses[variant],
      className,
    )}
  >
    {children}
  </span>
);
