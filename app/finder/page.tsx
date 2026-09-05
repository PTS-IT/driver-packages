"use client";

import { useState } from "react";
import { useLocalStorage } from "@/lib/useLocalStorage";
import type { LostPensionLead } from "@/lib/types";
import ChecklistSection from "@/components/ChecklistSection";
import LeadCard from "@/components/LeadCard";
import LeadForm from "@/components/LeadForm";

const STORAGE_KEY = "pension-tracker.leads";

export default function FinderPage() {
  const [leads, setLeads, hydrated] = useLocalStorage<LostPensionLead[]>(STORAGE_KEY, []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  const editingLead = leads.find((l) => l.id === editingId);

  function handleAdd(lead: LostPensionLead) {
    setLeads([lead, ...leads]);
    setShowAddForm(false);
  }

  function handleUpdate(lead: LostPensionLead) {
    setLeads(leads.map((l) => (l.id === lead.id ? lead : l)));
    setEditingId(null);
  }

  function handleDelete(id: string) {
    if (!window.confirm("Remove this lead?")) return;
    setLeads(leads.filter((l) => l.id !== id));
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Lost pension finder</h1>
        <p className="mt-1 text-sm text-black/60 dark:text-white/60">
          There&apos;s no single database of every pension in the UK, so tracking one down means a
          bit of legwork. This tool walks you through the official free routes and helps you keep
          track of who you&apos;ve contacted.
        </p>
      </div>

      <ChecklistSection />

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold">Leads to follow up</h2>
            <p className="mt-0.5 text-sm text-black/60 dark:text-white/60">
              Track each former employer or possible provider while you research.
            </p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="shrink-0 rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/80 dark:bg-white dark:text-black dark:hover:bg-white/80"
            >
              + Add lead
            </button>
          )}
        </div>

        {showAddForm && <LeadForm onSave={handleAdd} onCancel={() => setShowAddForm(false)} />}

        {!hydrated ? null : leads.length === 0 && !showAddForm ? (
          <div className="rounded-xl border border-dashed border-black/15 p-10 text-center dark:border-white/15">
            <p className="text-black/60 dark:text-white/60">No leads tracked yet.</p>
            <p className="mt-1 text-sm text-black/40 dark:text-white/40">
              Add a former employer above once you start working through the checklist.
            </p>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leads.map((lead) =>
              editingId === lead.id && editingLead ? (
                <div key={lead.id} className="sm:col-span-2 lg:col-span-3">
                  <LeadForm
                    initialLead={editingLead}
                    onSave={handleUpdate}
                    onCancel={() => setEditingId(null)}
                  />
                </div>
              ) : (
                <LeadCard
                  key={lead.id}
                  lead={lead}
                  onEdit={() => setEditingId(lead.id)}
                  onDelete={() => handleDelete(lead.id)}
                />
              )
            )}
          </div>
        )}
      </section>
    </div>
  );
}
