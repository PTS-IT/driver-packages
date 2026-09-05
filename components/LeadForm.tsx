"use client";

import { useState } from "react";
import type { LeadStatus, LostPensionLead } from "@/lib/types";
import { generateId } from "@/lib/utils";

const STATUS_LABELS: Record<LeadStatus, string> = {
  not_started: "Not started",
  researching: "Researching",
  contacted: "Contacted",
  found: "Found",
  dead_end: "Dead end",
};

const emptyLead = (): LostPensionLead => ({
  id: generateId(),
  employerName: "",
  approxStartYear: "",
  approxEndYear: "",
  providerNameIfKnown: "",
  status: "not_started",
  notes: "",
});

export default function LeadForm({
  initialLead,
  onSave,
  onCancel,
}: {
  initialLead?: LostPensionLead;
  onSave: (lead: LostPensionLead) => void;
  onCancel: () => void;
}) {
  const [lead, setLead] = useState<LostPensionLead>(initialLead ?? emptyLead());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!lead.employerName.trim()) return;
    onSave(lead);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Former employer *</span>
          <input
            required
            type="text"
            value={lead.employerName}
            onChange={(e) => setLead({ ...lead, employerName: e.target.value })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Status</span>
          <select
            value={lead.status}
            onChange={(e) => setLead({ ...lead, status: e.target.value as LeadStatus })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Approx. start year</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2008"
            value={lead.approxStartYear}
            onChange={(e) => setLead({ ...lead, approxStartYear: e.target.value })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Approx. end year</span>
          <input
            type="text"
            inputMode="numeric"
            placeholder="e.g. 2011"
            value={lead.approxEndYear}
            onChange={(e) => setLead({ ...lead, approxEndYear: e.target.value })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          <span className="font-medium">Pension provider (if known)</span>
          <input
            type="text"
            value={lead.providerNameIfKnown}
            onChange={(e) => setLead({ ...lead, providerNameIfKnown: e.target.value })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          value={lead.notes}
          onChange={(e) => setLead({ ...lead, notes: e.target.value })}
          rows={3}
          placeholder="Who did you contact, what did they say, what's the next step?"
          className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
        />
      </label>

      <div className="flex justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md px-4 py-2 text-sm font-medium text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
        >
          {initialLead ? "Save changes" : "Add lead"}
        </button>
      </div>
    </form>
  );
}
