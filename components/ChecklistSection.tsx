"use client";

import { useLocalStorage } from "@/lib/useLocalStorage";
import { CHECKLIST_STEPS } from "@/lib/checklistSteps";
import type { ChecklistState } from "@/lib/types";

const STORAGE_KEY = "pension-tracker.finder-checklist";

export default function ChecklistSection() {
  const [checked, setChecked] = useLocalStorage<ChecklistState>(STORAGE_KEY, {});

  const doneCount = CHECKLIST_STEPS.filter((step) => checked[step.id]).length;

  function toggle(id: string) {
    setChecked({ ...checked, [id]: !checked[id] });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Step-by-step checklist</h2>
        <span className="text-sm text-black/50 dark:text-white/50">
          {doneCount} / {CHECKLIST_STEPS.length} complete
        </span>
      </div>

      <ol className="space-y-3">
        {CHECKLIST_STEPS.map((step, index) => (
          <li
            key={step.id}
            className="flex gap-3 rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900"
          >
            <input
              type="checkbox"
              checked={!!checked[step.id]}
              onChange={() => toggle(step.id)}
              className="mt-1 h-4 w-4 shrink-0"
              aria-label={`Mark step ${index + 1} complete`}
            />
            <div className={checked[step.id] ? "opacity-50" : ""}>
              <p className="font-medium">
                {index + 1}. {step.title}
              </p>
              <p className="mt-0.5 text-sm text-black/60 dark:text-white/60">{step.description}</p>
              {step.linkHref && (
                <a
                  href={step.linkHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 inline-block text-sm font-medium underline underline-offset-2"
                >
                  {step.linkLabel} ↗
                </a>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
