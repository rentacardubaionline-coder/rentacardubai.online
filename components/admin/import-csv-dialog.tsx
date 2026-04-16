"use client";

import { useRef, useState, useTransition } from "react";
import { Upload, FileText, AlertCircle, CheckCircle2, X } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { importBusinessesCSVAction, type CsvRow } from "@/app/actions/admin-businesses";

const CSV_HEADERS: (keyof CsvRow)[] = [
  "name", "category", "city", "phone", "whatsapp_phone", "email",
  "website_url", "address_line", "description", "logo_url", "cover_url",
  "image_1_url", "image_2_url", "image_3_url", "image_4_url", "image_5_url", "image_6_url",
  "rating", "established_year", "google_maps_url",
];

/** Parses a CSV string into an array of objects keyed by the header row. */
function parseCSV(text: string): CsvRow[] {
  const lines = text.trim().split(/\r?\n/);
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]).map((h) => h.trim().toLowerCase()) as (keyof CsvRow)[];
  const rows: CsvRow[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.every((v) => !v.trim())) continue; // skip empty lines
    const row: Partial<CsvRow> = {};
    headers.forEach((h, idx) => {
      (row as any)[h] = values[idx]?.trim() ?? "";
    });
    rows.push(row as CsvRow);
  }
  return rows;
}

function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) {
      values.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  values.push(current);
  return values;
}

type ImportResult = { created: number; errors: string[] } | null;

export function ImportCSVDialog() {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [rows, setRows] = useState<CsvRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [parseError, setParseError] = useState("");
  const [result, setResult] = useState<ImportResult>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setParseError("");
    setResult(null);

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const parsed = parseCSV(ev.target?.result as string);
        if (parsed.length === 0) {
          setParseError("No data rows found. Make sure your CSV has a header row and at least one data row.");
          setRows([]);
        } else {
          setRows(parsed);
        }
      } catch {
        setParseError("Failed to parse CSV. Check the file format.");
        setRows([]);
      }
    };
    reader.readAsText(file);
  }

  function handleImport() {
    if (rows.length === 0) return;
    startTransition(async () => {
      const res = await importBusinessesCSVAction(rows);
      setResult(res);
      if (res.errors.length === 0) {
        toast.success(`${res.created} businesses imported successfully`);
      } else {
        toast.warning(`${res.created} created, ${res.errors.length} failed`);
      }
    });
  }

  function handleClose() {
    setRows([]);
    setFileName("");
    setParseError("");
    setResult(null);
    if (fileRef.current) fileRef.current.value = "";
  }

  const previewRows = rows.slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) handleClose(); }}>
      <DialogTrigger render={<Button variant="outline" size="sm" />}>
        <Upload className="mr-1.5 h-4 w-4" />
        Import CSV
      </DialogTrigger>

      <DialogContent className="max-w-2xl p-0 gap-0" showCloseButton={false}>
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-surface-muted">
          <DialogTitle className="text-base font-bold">Import Businesses from CSV</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[65vh] px-6 py-4 space-y-4">

          {/* Result banner */}
          {result && (
            <div className={`flex items-start gap-3 rounded-xl p-4 ${result.errors.length === 0 ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-800"}`}>
              {result.errors.length === 0
                ? <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-600" />
                : <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
              }
              <div className="space-y-1 text-sm">
                <p className="font-semibold">
                  {result.created} business{result.created !== 1 ? "es" : ""} imported
                  {result.errors.length > 0 && `, ${result.errors.length} failed`}
                </p>
                {result.errors.map((e, i) => (
                  <p key={i} className="text-xs opacity-80">{e}</p>
                ))}
              </div>
            </div>
          )}

          {/* File drop area */}
          {!result && (
            <label className="flex flex-col items-center gap-3 rounded-xl border-2 border-dashed border-border bg-surface-muted/40 px-6 py-8 cursor-pointer hover:border-amber-400 hover:bg-amber-50/30 transition-colors">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
                <FileText className="h-5 w-5" />
              </div>
              {fileName ? (
                <div className="text-center">
                  <p className="text-sm font-semibold text-ink-900">{fileName}</p>
                  <p className="text-xs text-ink-500">{rows.length} rows parsed</p>
                </div>
              ) : (
                <div className="text-center">
                  <p className="text-sm font-medium text-ink-700">Click to upload CSV</p>
                  <p className="text-xs text-ink-400 mt-0.5">or drag and drop</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={handleFile} className="sr-only" />
            </label>
          )}

          {/* Parse error */}
          {parseError && (
            <div className="flex items-center gap-2 rounded-lg bg-rose-50 px-4 py-3 text-sm text-rose-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {parseError}
            </div>
          )}

          {/* Preview table */}
          {rows.length > 0 && !result && (
            <div className="space-y-2">
              <p className="text-xs font-semibold text-ink-600">
                Preview — first {previewRows.length} of {rows.length} rows
              </p>
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-xs">
                  <thead className="bg-surface-muted/60">
                    <tr>
                      {["Name", "Category", "City", "Phone", "Email", "Rating"].map((h) => (
                        <th key={h} className="px-3 py-2 text-left font-semibold text-ink-600 whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-muted">
                    {previewRows.map((row, i) => (
                      <tr key={i}>
                        <td className="px-3 py-2 font-medium text-ink-900 max-w-[140px] truncate">{row.name || <span className="text-rose-500">missing</span>}</td>
                        <td className="px-3 py-2 text-ink-600">{row.category || "—"}</td>
                        <td className="px-3 py-2 text-ink-600">{row.city || <span className="text-rose-500">missing</span>}</td>
                        <td className="px-3 py-2 text-ink-600">{row.phone || "—"}</td>
                        <td className="px-3 py-2 text-ink-600 max-w-[120px] truncate">{row.email || "—"}</td>
                        <td className="px-3 py-2 text-ink-600">{row.rating || "4.0"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {rows.length > 3 && (
                <p className="text-xs text-ink-400">…and {rows.length - 3} more rows</p>
              )}
            </div>
          )}

        </div>

        <DialogFooter className="px-6 py-4 border-t border-surface-muted bg-transparent -mx-0 -mb-0 rounded-b-xl">
          <DialogClose render={<Button variant="outline" size="sm" disabled={pending} />} onClick={handleClose}>
            {result ? "Close" : "Cancel"}
          </DialogClose>
          {!result && (
            <Button size="sm" onClick={handleImport} disabled={pending || rows.length === 0}>
              {pending ? "Importing…" : `Import ${rows.length} row${rows.length !== 1 ? "s" : ""}`}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
