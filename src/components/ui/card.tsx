import { clsx } from "clsx";
import type { ReactNode } from "react";

type CardProps = {
  className?: string;
  children: ReactNode;
};

export const Card = ({ className, children }: CardProps) => (
  <div
    className={clsx(
      "rounded-2xl border border-zinc-200/70 bg-white p-6 shadow-sm shadow-zinc-500/10 dark:border-zinc-800 dark:bg-zinc-900 dark:shadow-none",
      className,
    )}
  >
    {children}
  </div>
);

type CardHeaderProps = {
  className?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
};

export const CardHeader = ({
  className,
  title,
  description,
  actions,
}: CardHeaderProps) => (
  <div
    className={clsx(
      "mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
      className,
    )}
  >
    <div>
      <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
        {title}
      </h2>
      {description ? (
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          {description}
        </p>
      ) : null}
    </div>
    {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
  </div>
);

export const CardContent = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => (
  <div className={clsx("space-y-4", className)}>{children}</div>
);
