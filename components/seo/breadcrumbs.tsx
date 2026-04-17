import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

interface BreadcrumbsProps {
  items: { name: string; href: string }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  if (items.length <= 1) return null;

  return (
    <nav aria-label="Breadcrumb" className="mb-4">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-ink-500">
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <li key={item.href} className="flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" />}
              {isLast ? (
                <span className="font-medium text-ink-900 truncate max-w-[200px]">
                  {i === 0 ? <Home className="h-3.5 w-3.5 inline-block" /> : item.name}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-brand-600 transition-colors truncate max-w-[160px]"
                >
                  {i === 0 ? <Home className="h-3.5 w-3.5" /> : item.name}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
