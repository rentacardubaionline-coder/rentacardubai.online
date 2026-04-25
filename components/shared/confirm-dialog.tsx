"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConfirmOptions {
  title: string;
  description?: string;
  /** Defaults to "Confirm". */
  confirmLabel?: string;
  /** Defaults to "Cancel". */
  cancelLabel?: string;
  /** When true, the confirm button is rose-tinted and the icon is the warning triangle. */
  destructive?: boolean;
  /** When set, an inline textarea collects a reason; the resolved value
   *  becomes a string (the reason text) instead of a boolean. */
  reasonLabel?: string;
  reasonPlaceholder?: string;
  reasonRequired?: boolean;
}

type Resolver = (value: boolean | string | null) => void;

const ConfirmContext = createContext<{
  confirm: (opts: ConfirmOptions) => Promise<boolean | string | null>;
} | null>(null);

/**
 * Promise-based replacement for `window.confirm()`. Mount the provider once
 * in the root layout, then call `useConfirm()` from any client component.
 *
 *   const confirm = useConfirm();
 *   const ok = await confirm({ title: "Delete?", destructive: true });
 *   if (!ok) return;
 *
 * For destructive actions that need a reason, pass `reasonLabel`; the resolved
 * value is the reason string (or null if cancelled).
 */
export function ConfirmDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ConfirmOptions | null>(null);
  const [reason, setReason] = useState("");
  const resolverRef = useRef<Resolver | null>(null);

  const confirm = useCallback((next: ConfirmOptions) => {
    setOpts(next);
    setReason("");
    setOpen(true);
    return new Promise<boolean | string | null>((resolve) => {
      resolverRef.current = resolve;
    });
  }, []);

  function handleCancel() {
    resolverRef.current?.(opts?.reasonLabel ? null : false);
    resolverRef.current = null;
    setOpen(false);
  }

  function handleConfirm() {
    if (opts?.reasonLabel) {
      if (opts.reasonRequired && !reason.trim()) return; // block until they type
      resolverRef.current?.(reason.trim());
    } else {
      resolverRef.current?.(true);
    }
    resolverRef.current = null;
    setOpen(false);
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}

      <Dialog
        open={open}
        onOpenChange={(o) => {
          if (!o) handleCancel();
        }}
      >
        <DialogContent className="sm:max-w-md">
          {opts && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-base">
                  {opts.destructive && (
                    <span className="flex size-8 items-center justify-center rounded-lg bg-rose-50 text-rose-600">
                      <AlertTriangle className="h-4 w-4" />
                    </span>
                  )}
                  {opts.title}
                </DialogTitle>
                {opts.description && (
                  <DialogDescription>{opts.description}</DialogDescription>
                )}
              </DialogHeader>

              {opts.reasonLabel && (
                <div className="space-y-1.5 pt-1">
                  <Label htmlFor="confirm-reason" className="text-sm font-semibold">
                    {opts.reasonLabel}
                    {opts.reasonRequired && (
                      <span className="ml-1 text-rose-500">*</span>
                    )}
                  </Label>
                  <Textarea
                    id="confirm-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder={opts.reasonPlaceholder ?? "Add a short reason…"}
                    rows={3}
                    autoFocus
                  />
                </div>
              )}

              <div className="mt-2 flex justify-end gap-2">
                <Button variant="outline" onClick={handleCancel}>
                  {opts.cancelLabel ?? "Cancel"}
                </Button>
                <Button
                  onClick={handleConfirm}
                  disabled={
                    Boolean(opts.reasonLabel && opts.reasonRequired && !reason.trim())
                  }
                  className={cn(
                    opts.destructive &&
                      "bg-rose-600 text-white hover:bg-rose-700",
                  )}
                >
                  {opts.confirmLabel ?? "Confirm"}
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used inside a ConfirmDialogProvider");
  }
  return ctx.confirm;
}
