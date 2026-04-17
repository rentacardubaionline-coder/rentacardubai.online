import Link from "next/link";
import { Search, Users, ShieldCheck, Building2, User } from "lucide-react";
import { AdminTabBar } from "@/components/admin/admin-tab-bar";

const USER_SECTION_TABS = [
  { href: "/admin/users",     label: "All Users",   Icon: Users,      exact: true },
  { href: "/admin/users/kyc", label: "KYC Review",  Icon: ShieldCheck },
];
import { requireRole } from "@/lib/auth/guards";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { UserActionsMenu } from "@/components/admin/user-actions-menu";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;

type RoleFilter = "all" | "customer" | "vendor" | "admin";

function formatDate(iso: string | null) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function RoleBadge({ role }: { role: string }) {
  const map: Record<string, string> = {
    admin: "bg-amber-50 text-amber-700 ring-amber-200",
    vendor: "bg-purple-50 text-purple-700 ring-purple-200",
    customer: "bg-surface-muted text-ink-600 ring-border",
  };
  const icons: Record<string, React.ElementType> = {
    admin: ShieldCheck,
    vendor: Building2,
    customer: User,
  };
  const Icon = icons[role] ?? User;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ring-inset capitalize",
        map[role] ?? map.customer
      )}
    >
      <Icon className="h-3 w-3" />
      {role}
    </span>
  );
}

interface PageProps {
  searchParams: Promise<{ q?: string; role?: string; page?: string }>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const adminProfile = await requireRole("admin");
  const db = createAdminClient();

  const { q = "", role: roleFilter = "all", page: pageStr = "1" } = await searchParams;
  const page = Math.max(1, parseInt(pageStr) || 1);
  const offset = (page - 1) * PAGE_SIZE;
  const roleFilterTyped = (["all", "customer", "vendor", "admin"].includes(roleFilter)
    ? roleFilter
    : "all") as RoleFilter;

  // Build query
  let query = db
    .from("profiles")
    .select("id, email, full_name, phone, role, is_vendor, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  if (roleFilterTyped !== "all") {
    query = query.eq("role", roleFilterTyped);
  }
  if (q.trim()) {
    query = query.or(`email.ilike.%${q}%,full_name.ilike.%${q}%`);
  }

  const { data: users, count } = await query;

  // Role counts for tab badges
  const [
    { count: totalCount },
    { count: customerCount },
    { count: vendorCount },
    { count: adminCount },
  ] = await Promise.all([
    db.from("profiles").select("*", { count: "exact", head: true }),
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "customer"),
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "vendor"),
    db.from("profiles").select("*", { count: "exact", head: true }).eq("role", "admin"),
  ]);

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE);

  function buildHref(params: Record<string, string>) {
    const sp = new URLSearchParams({ q, role: roleFilterTyped, page: String(page), ...params });
    return `/admin/users?${sp.toString()}`;
  }

  const TABS = [
    { key: "all", label: "All", count: totalCount ?? 0 },
    { key: "customer", label: "Customers", count: customerCount ?? 0 },
    { key: "vendor", label: "Vendors", count: vendorCount ?? 0 },
    { key: "admin", label: "Admins", count: adminCount ?? 0 },
  ] as const;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-ink-900">Users</h1>
          <p className="mt-0.5 text-sm text-ink-500">
            {count ?? 0} user{count !== 1 ? "s" : ""} total
          </p>
        </div>
      </div>

      {/* Section tabs (Users / KYC) */}
      <AdminTabBar tabs={USER_SECTION_TABS} />

      {/* Search + role filter */}
      <div className="space-y-3">
        {/* Search bar */}
        <form method="GET" action="/admin/users">
          <input type="hidden" name="role" value={roleFilterTyped} />
          <input type="hidden" name="page" value="1" />
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400 pointer-events-none" />
            <input
              name="q"
              defaultValue={q}
              placeholder="Search by name or email…"
              className="h-10 w-full max-w-sm rounded-xl border border-border bg-white pl-9 pr-4 text-sm text-ink-900 placeholder:text-ink-400 outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 transition-all"
            />
          </div>
        </form>

        {/* Role filter tabs */}
        <div className="flex gap-1 border-b border-surface-muted">
          {TABS.map((tab) => {
            const active = roleFilterTyped === tab.key;
            return (
              <Link
                key={tab.key}
                href={buildHref({ role: tab.key, page: "1" })}
                className={cn(
                  "flex items-center gap-1.5 border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition-colors",
                  active
                    ? "border-amber-500 text-amber-700"
                    : "border-transparent text-ink-500 hover:text-ink-900"
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    "rounded-full px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                    active ? "bg-amber-100 text-amber-700" : "bg-surface-muted text-ink-400"
                  )}
                >
                  {tab.count}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border border-border bg-white shadow-sm overflow-hidden">
        {!users || users.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-16 text-center">
            <Users className="h-8 w-8 text-ink-300" />
            <p className="font-medium text-ink-500">No users found</p>
            {q && (
              <p className="text-sm text-ink-400">
                No results for &ldquo;<strong>{q}</strong>&rdquo;
              </p>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-surface-muted/50 hover:bg-surface-muted/50">
                <TableHead className="pl-5">User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Vendor</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="pr-5 text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => {
                const initials = (user.full_name ?? user.email ?? "?")
                  .split(" ")
                  .map((w) => w[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase();
                const isSelf = user.id === adminProfile.id;

                return (
                  <TableRow key={user.id}>
                    {/* User */}
                    <TableCell className="pl-5">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-bold",
                            user.role === "admin"
                              ? "bg-amber-100 text-amber-700"
                              : user.role === "vendor"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-50 text-blue-600"
                          )}
                        >
                          {initials}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-ink-900 max-w-[160px]">
                            {user.full_name ?? (
                              <span className="font-normal text-ink-400">No name</span>
                            )}
                            {isSelf && (
                              <span className="ml-1.5 text-[10px] font-bold text-amber-600">(you)</span>
                            )}
                          </p>
                          <p className="truncate text-xs text-ink-500 max-w-[160px]">{user.email}</p>
                        </div>
                      </div>
                    </TableCell>

                    {/* Role */}
                    <TableCell>
                      <RoleBadge role={user.role} />
                    </TableCell>

                    {/* Vendor */}
                    <TableCell>
                      {user.is_vendor ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200">
                          <Building2 className="h-3 w-3" />
                          Vendor
                        </span>
                      ) : (
                        <span className="text-xs text-ink-300">—</span>
                      )}
                    </TableCell>

                    {/* Phone */}
                    <TableCell className="text-sm text-ink-600">
                      {user.phone ?? <span className="text-ink-300">—</span>}
                    </TableCell>

                    {/* Joined */}
                    <TableCell className="text-sm text-ink-500">
                      {formatDate(user.created_at)}
                    </TableCell>

                    {/* Actions */}
                    <TableCell className="pr-5 text-right">
                      <UserActionsMenu
                        userId={user.id}
                        currentRole={user.role}
                        isVendor={user.is_vendor}
                        isSelf={isSelf}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-ink-500">
          <p>
            Showing {offset + 1}–{Math.min(offset + PAGE_SIZE, count ?? 0)} of {count ?? 0}
          </p>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={buildHref({ page: String(page - 1) })}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={buildHref({ page: String(page + 1) })}
                className="rounded-lg border border-border bg-white px-3 py-1.5 text-sm font-medium text-ink-700 hover:bg-surface-muted transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
