"use client";

import { useState } from "react";
import type { PensionPot, PensionPotStatus, PensionPotType } from "@/lib/types";
import { generateId } from "@/lib/utils";

const TYPE_LABELS: Record<PensionPotType, string> = {
  workplace: "Workplace pension",
  personal: "Personal pension",
  defined_benefit: "Defined benefit (final salary)",
  state: "State pension",
  other: "Other",
};

const STATUS_LABELS: Record<PensionPotStatus, string> = {
  active: "Active",
  transferred: "Transferred",
  closed: "Closed",
};

const emptyPot = (): PensionPot => ({
  id: generateId(),
  provider: "",
  type: "workplace",
  estimatedValue: null,
  referenceNumber: "",
  lastUpdated: new Date().toISOString().slice(0, 10),
  contactPhone: "",
  contactEmail: "",
  notes: "",
  status: "active",
});

export default function PotForm({
  initialPot,
  onSave,
  onCancel,
}: {
  initialPot?: PensionPot;
  onSave: (pot: PensionPot) => void;
  onCancel: () => void;
}) {
  const [pot, setPot] = useState<PensionPot>(initialPot ?? emptyPot());

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pot.provider.trim()) return;
    onSave(pot);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-black/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-neutral-900"
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Provider name *</span>
          <input
            required
            type="text"
            value={pot.provider}
            onChange={(e) => setPot({ ...pot, provider: e.target.value })}
            placeholder="e.g. Aviva, Nest, Scottish Widows"
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Pot type</span>
          <select
            value={pot.type}
            onChange={(e) => setPot({ ...pot, type: e.target.value as PensionPotType })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Estimated value (£)</span>
          <input
            type="number"
            min={0}
            step="1"
            value={pot.estimatedValue ?? ""}
            onChange={(e) =>
              setPot({
                ...pot,
                estimatedValue: e.target.value === "" ? null : Number(e.target.value),
              })
            }
            placeholder="Leave blank if unknown"
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Reference / policy number</span>
          <input
            type="text"
            value={pot.referenceNumber}
            onChange={(e) => setPot({ ...pot, referenceNumber: e.target.value })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Last checked</span>
          <input
            type="date"
            value={pot.lastUpdated}
            onChange={(e) => setPot({ ...pot, lastUpdated: e.target.value })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Status</span>
          <select
            value={pot.status}
            onChange={(e) => setPot({ ...pot, status: e.target.value as PensionPotStatus })}
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
          <span className="font-medium">Contact phone</span>
          <input
            type="tel"
            value={pot.contactPhone}
            onChange={(e) => setPot({ ...pot, contactPhone: e.target.value })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>

        <label className="flex flex-col gap-1 text-sm">
          <span className="font-medium">Contact email</span>
          <input
            type="email"
            value={pot.contactEmail}
            onChange={(e) => setPot({ ...pot, contactEmail: e.target.value })}
            className="rounded-md border border-black/15 px-3 py-2 text-sm dark:border-white/15 dark:bg-neutral-800"
          />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium">Notes</span>
        <textarea
          value={pot.notes}
          onChange={(e) => setPot({ ...pot, notes: e.target.value })}
          rows={3}
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
          {initialPot ? "Save changes" : "Add pension pot"}
        </button>
      </div>
    </form>
  );
}
