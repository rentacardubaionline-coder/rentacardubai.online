import Link from "next/link";
import { FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-4 py-16">
      <div className="flex max-w-md flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-ink-100">
          <FileQuestion className="h-10 w-10 text-ink-400" />
        </div>
        <h1 className="mb-2 text-3xl font-black text-ink-900">Page not found</h1>
        <p className="mb-8 text-sm text-ink-500">
          We couldn&apos;t find the page you were looking for. It might have been moved or doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="rounded-xl bg-amber-500 px-6 py-3 text-sm font-bold text-white shadow-md shadow-amber-500/20 transition-all hover:bg-amber-600 hover:shadow-lg hover:shadow-amber-500/30"
        >
          Go back home
        </Link>
      </div>
    </div>
  );
}
