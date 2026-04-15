import Link from "next/link";

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface-muted px-6 text-center">
      <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-8 max-w-sm w-full">
        <h1 className="text-lg font-bold text-destructive">Link expired</h1>
        <p className="mt-2 text-sm text-ink-600">
          This sign-in link has expired or has already been used. Please request
          a new one.
        </p>
        <Link
          href="/login"
          className="mt-5 inline-block rounded-lg bg-brand-500 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-600 transition-colors"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
