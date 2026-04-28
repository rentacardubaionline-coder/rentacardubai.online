"use client";

import { useState } from "react";
import { Trash2, Loader2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { deleteListingAdminAction } from "@/app/actions/admin-listings";
import { toast } from "sonner";

interface Props {
  id: string;
  title: string;
}

export function ListingDeleteButton({ id, title }: Props) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  async function handleDelete() {
    if (
      !confirm(
        `Are you sure you want to permanently delete "${title}"? This cannot be undone.`,
      )
    ) {
      return;
    }

    setLoading(true);
    const res = await deleteListingAdminAction(id);
    if (res.error) {
      toast.error(res.error);
      setLoading(false);
    } else {
      toast.success(`"${title}" deleted`);
      if (pathname.includes(id)) {
        router.push("/admin/listings");
      } else {
        setLoading(false);
      }
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={loading}
      className="text-ink-400 hover:text-rose-600 transition-colors disabled:opacity-50"
      title="Delete listing"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
    </button>
  );
}
