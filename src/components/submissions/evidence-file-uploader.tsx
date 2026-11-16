"use client";

import { useState, type FormEvent } from "react";
import { attachEvidenceFile } from "@/features/submissions/actions";
import { Button } from "@/components/ui/button";

const allowedTypes = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp", "text/plain"]);

export function EvidenceFileUploader({ submissionId }: { submissionId: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function upload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = event.currentTarget;
    const data = new FormData(form);
    const file = data.get("file");
    if (!(file instanceof File) || !file.size) {
      setError("Choose a file first.");
      return;
    }
    if (!allowedTypes.has(file.type) || file.size > 10 * 1024 * 1024) {
      setError("Choose a PDF, PNG, JPEG, WebP, or text file up to 10 MB.");
      return;
    }
    setBusy(true);
    let uploaded: { objectKey: string };
    try {
      const response = await fetch("/api/uploads/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileName: file.name, contentType: file.type, byteSize: file.size }),
      });
      const payload = await response.json() as { uploadUrl?: string; objectKey?: string; error?: string };
      if (!response.ok || !payload.uploadUrl || !payload.objectKey) throw new Error(payload.error ?? "Could not prepare file upload.");
      const put = await fetch(payload.uploadUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
      if (!put.ok) throw new Error("The storage service rejected the upload. Check the bucket CORS settings and try again.");
      uploaded = { objectKey: payload.objectKey };
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Upload failed.");
      setBusy(false);
      return;
    }
    const actionData = new FormData();
    actionData.set("submissionId", submissionId);
    actionData.set("title", String(data.get("title") ?? file.name));
    actionData.set("objectKey", uploaded.objectKey);
    actionData.set("contentType", file.type);
    actionData.set("byteSize", String(file.size));
    await attachEvidenceFile(actionData);
  }

  return <form onSubmit={upload} className="mt-4 grid gap-3 rounded-lg border border-dashed border-surface-300 p-4 sm:grid-cols-[1fr_1.4fr_auto] sm:items-end"><div><label htmlFor={`file-title-${submissionId}`} className="text-xs font-medium">File title</label><input id={`file-title-${submissionId}`} name="title" maxLength={100} placeholder="Screenshot or project brief" className="mt-1.5 min-h-10 w-full rounded-md border border-surface-200 px-3 text-sm" /></div><div><label htmlFor={`file-${submissionId}`} className="text-xs font-medium">File (10 MB max)</label><input id={`file-${submissionId}`} name="file" type="file" accept="application/pdf,image/jpeg,image/png,image/webp,text/plain" required className="mt-1.5 block w-full text-xs file:mr-3 file:rounded-md file:border-0 file:bg-surface-100 file:px-3 file:py-2" /></div><Button type="submit" disabled={busy} variant="outline">{busy ? "Uploading…" : "Upload file"}</Button>{error && <p role="alert" className="text-xs text-red-700 sm:col-span-3">{error}</p>}</form>;
}
