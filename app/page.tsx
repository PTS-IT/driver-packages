"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import type { PensionPot } from "@/lib/types";
import PotCard from "@/components/PotCard";
import PotForm from "@/components/PotForm";
import SummaryStats from "@/components/SummaryStats";

const STORAGE_KEY = "pension-tracker.pots";

export default function DashboardPage() {
  const [pots, setPots, hydrated] = useLocalStorage<PensionPot[]>(STORAGE_KEY, []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const editingPot = pots.find((p) => p.id === editingId);

  function handleAdd(pot: PensionPot) {
    setPots([pot, ...pots]);
    setShowAddForm(false);
  }

  function handleUpdate(pot: PensionPot) {
    setPots(pots.map((p) => (p.id === pot.id ? pot : p)));
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this pension pot from your dashboard?")) return;
    setPots(pots.filter((p) => p.id !== id));
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your pension dashboard</h1>
          <p className="mt-1 text-sm text-black/60 dark:text-white/60">
            All of your pension pots in one place. Data is stored only in this browser.
          </p>
        </div>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
          >
            + Add pension pot
          </button>
        )}
      </div>

      <SummaryStats pots={pots} />

      {showAddForm && (
        <PotForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />
      )}

      {!hydrated ? null : pots.length === 0 && !showAddForm ? (
        <div className="rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
          <p className="text-black/60 dark:text-white/60">
            You haven&apos;t added any pension pots yet.
          </p>
          <p className="mt-1 text-sm text-black/40 dark:text-white/40">
            Not sure where all your pensions are?{" "}
            <a href="/finder" className="underline underline-offset-2">
              Use the lost pension finder
            </a>
            .
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pots.map((pot) =>
            editingId === pot.id && editingPot ? (
              <div key={pot.id} className="sm:col-span-2 lg:col-span-3">
                <PotForm
                  initialPot={editingPot}
                  onSave={handleUpdate}
                  onCancel={() => setEditingId(null)}
                />
              </div>
            ) : (
              <PotCard
                key={pot.id}
                pot={pot}
                onEdit={() => setEditingId(pot.id)}
                onDelete={() => handleDelete(pot.id)}
              />
            )
          )}
        </div>
      )}
    </div>
  );
}
