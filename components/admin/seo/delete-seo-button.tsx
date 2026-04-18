"use client";

import { useTransition } from "react";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type DeleteResult = { error?: string };

interface DeleteSeoButtonProps {
  id: string;
  name: string;
  confirmText?: string;
  action: (id: string) => Promise<DeleteResult>;
}

export function DeleteSeoButton({ id, name, confirmText, action }: DeleteSeoButtonProps) {
  const [pending, startTransition] = useTransition();

  function handleDelete() {
    const msg = confirmText ?? `Delete "${name}"? This cannot be undone.`;
    if (!confirm(msg)) return;
    startTransition(async () => {
      const res = await action(id);
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
