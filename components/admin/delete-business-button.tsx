"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useConfirm } from "@/components/shared/confirm-dialog";
import { deleteBusinessAction } from "@/app/actions/admin-businesses";

export function DeleteBusinessButton({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const confirm = useConfirm();

  async function handleDelete() {
    const ok = await confirm({
      title: `Delete "${name}"?`,
      description: "This will also delete all its listings and images. This cannot be undone.",
      confirmLabel: "Delete business",
      destructive: true,
    });
    if (!ok) return;
    startTransition(async () => {
      const res = await deleteBusinessAction(id);
      if (res.error) toast.error(res.error);
      else toast.success(`"${name}" deleted`);
    });
  }

  return (
    <Button
      variant="ghost"
      size="icon-sm"
      disabled={pending}
      onClick={handleDelete}
      className="text-ink-400 hover:text-rose-600 hover:bg-rose-50"
      aria-label={`Delete ${name}`}
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}
