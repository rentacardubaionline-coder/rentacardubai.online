import { cn, formatPkr } from "@/lib/utils";

type Props = {
  amount: number;
  suffix?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
};

const sizes: Record<NonNullable<Props["size"]>, string> = {
  sm: "text-base font-semibold",
  md: "text-xl font-bold",
  lg: "text-3xl font-extrabold",
};

export function Price({ amount, suffix, size = "md", className }: Props) {
  return (
    <span className={cn("text-brand-700 tabular-nums", sizes[size], className)}>
      {formatPkr(amount)}
      {suffix ? (
        <span className="ml-1 text-sm font-medium text-ink-500">{suffix}</span>
      ) : null}
    </span>
  );
}
