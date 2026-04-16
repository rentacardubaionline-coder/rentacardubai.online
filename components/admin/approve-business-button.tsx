"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { approveBusinessAction, rejectBusinessAction } from "@/app/actions/admin-businesses";

interface Props {
  id: string;
  name: string;
}

export function ApproveBusinessButton({ id, name }: Props) {
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  async function handle(action: "approve" | "reject") {
    setLoading(action);
    const fn = action === "approve" ? approveBusinessAction : rejectBusinessAction;
    const result = await fn(id);
    if (result.error) alert(result.error);
    setLoading(null);
  }

  return (
    <div className="inline-flex items-center gap-1">
      <button
        onClick={() => handle("approve")}
        disabled={!!loading}
        title={`Approve ${name}`}
        className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-200 hover:bg-emerald-100 disabled:opacity-50 transition-colors"
      >
        {loading === "approve" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <CheckCircle2 className="h-3 w-3" />
        )}
        Approve
      </button>
      <button
        onClick={() => handle("reject")}
        disabled={!!loading}
        title={`Reject ${name}`}
        className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700 ring-1 ring-inset ring-rose-200 hover:bg-rose-100 disabled:opacity-50 transition-colors"
      >
        {loading === "reject" ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <XCircle className="h-3 w-3" />
        )}
        Reject
      </button>
    </div>
  );
}
