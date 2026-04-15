import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Props = {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "mb-8 flex gap-4",
        className?.includes("text-center")
          ? "flex-col items-center text-center"
          : "items-end justify-between",
        className
      )}
    >
      <div className={cn(className?.includes("text-center") ? "w-full" : "")}>
        {eyebrow ? (
          <div className="mb-2 text-xs font-semibold uppercase tracking-widest text-brand-600">
            {eyebrow}
          </div>
        ) : null}
        <h2 className="text-2xl font-bold tracking-tight text-ink-900 sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p className="mt-2 text-sm text-ink-500">{description}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
