"use client";

import type { LostPensionLead } from "@/lib/types";

const STATUS_STYLES: Record<LostPensionLead["status"], string> = {
  not_started: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  researching: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  contacted: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  found: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  dead_end: "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300",
};

const STATUS_LABELS: Record<LostPensionLead["status"], string> = {
  not_started: "Not started",
  researching: "Researching",
  contacted: "Contacted",
  found: "Found",
  dead_end: "Dead end",
};

export default function LeadCard({
  lead,
  onEdit,
  onDelete,
}: {
  lead: LostPensionLead;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const years =
    lead.approxStartYear || lead.approxEndYear
      ? `${lead.approxStartYear || "?"} – ${lead.approxEndYear || "?"}`
      : null;

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{lead.employerName}</h3>
          {years && <p className="text-sm text-black/50 dark:text-white/50">{years}</p>}
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[lead.status]}`}>
          {STATUS_LABELS[lead.status]}
        </span>
      </div>

      {lead.providerNameIfKnown && (
        <p className="text-sm">
          <span className="text-black/40 dark:text-white/40">Provider: </span>
          {lead.providerNameIfKnown}
        </p>
      )}

      {lead.notes && <p className="text-sm text-black/60 dark:text-white/60">{lead.notes}</p>}

      <div className="mt-1 flex justify-end gap-2 border-t border-black/5 pt-3 dark:border-white/10">
        <button
          onClick={onEdit}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-black/60 hover:bg-black/5 dark:text-white/60 dark:hover:bg-white/10"
        >
          Edit
        </button>
        <button
          onClick={onDelete}
          className="rounded-md px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
