import Link from "next/link";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-surface-muted px-8 py-16 text-center font-sans">
      <h1 className="text-5xl font-extrabold tracking-tight text-ink-900 sm:text-6xl">
        Hello <span className="text-brand-500">RentNowPk</span>
      </h1>
      <p className="mt-3 max-w-md text-ink-500">
        Phase 2 is live — Mulish + brand orange + Shadcn primitives are wired up.
      </p>
      <Link
        href="/kitchen-sink"
        className="mt-8 inline-flex items-center gap-2 rounded-lg bg-brand-500 px-5 py-2.5 text-sm font-semibold text-white shadow-pop transition-colors hover:bg-brand-600"
      >
        Open the Kitchen Sink →
      </Link>
    </main>
  );
}
