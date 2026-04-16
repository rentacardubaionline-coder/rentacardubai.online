import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { requireRole } from "@/lib/auth/guards";
import { AdminShell } from "@/components/layout/admin-shell";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profile = await requireRole("admin");

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-surface-muted">
      {/* Top nav — fixed height, never scrolls */}
      <header className="flex h-14 shrink-0 items-center border-b border-border bg-white px-6 shadow-sm">
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-amber-500 shadow-md shadow-amber-500/30">
            <ShieldCheck className="h-4 w-4 text-white" aria-hidden="true" />
          </div>
          <span className="font-black text-base text-ink-900 tracking-tight">
            RentNow<span className="text-amber-500">Pk</span>
            <span className="ml-1.5 rounded-md bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-widest text-amber-700">
              Admin
            </span>
          </span>
        </Link>
      </header>

      {/* Sidebar + content fill remaining height; each scrolls independently */}
      <AdminShell profile={{ full_name: profile.full_name, email: profile.email ?? "" }}>
        {children}
      </AdminShell>
    </div>
  );
}
