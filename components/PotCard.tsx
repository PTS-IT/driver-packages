"use client";

import type { PensionPot } from "@/lib/types";
import { formatCurrency, formatDate } from "@/lib/utils";

const TYPE_LABELS: Record<PensionPot["type"], string> = {
  workplace: "Workplace pension",
  personal: "Personal pension",
  defined_benefit: "Defined benefit (final salary)",
  state: "State pension",
  other: "Other",
};

const STATUS_STYLES: Record<PensionPot["status"], string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  transferred: "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  closed: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
};

export default function PotCard({
  pot,
  onEdit,
  onDelete,
}: {
  pot: PensionPot;
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="text-base font-semibold">{pot.provider}</h3>
          <p className="text-sm text-black/50 dark:text-white/50">{TYPE_LABELS[pot.type]}</p>
        </div>
        <span className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_STYLES[pot.status]}`}>
          {pot.status[0].toUpperCase() + pot.status.slice(1)}
        </span>
      </div>

      <div className="text-2xl font-semibold tabular-nums">{formatCurrency(pot.estimatedValue)}</div>

      <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm text-black/60 dark:text-white/60">
        {pot.referenceNumber && (
          <>
            <dt className="text-black/40 dark:text-white/40">Reference</dt>
            <dd>{pot.referenceNumber}</dd>
          </>
        )}
        <dt className="text-black/40 dark:text-white/40">Last checked</dt>
        <dd>{formatDate(pot.lastUpdated)}</dd>
        {pot.contactPhone && (
          <>
            <dt className="text-black/40 dark:text-white/40">Phone</dt>
            <dd>{pot.contactPhone}</dd>
          </>
        )}
        {pot.contactEmail && (
          <>
            <dt className="text-black/40 dark:text-white/40">Email</dt>
            <dd className="truncate">{pot.contactEmail}</dd>
          </>
        )}
      </dl>

      {pot.notes && <p className="text-sm text-black/60 dark:text-white/60">{pot.notes}</p>}

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
