import type { PensionPot } from "@/lib/types";
import { formatCurrency } from "@/lib/utils";

export default function SummaryStats({ pots }: { pots: PensionPot[] }) {
  const activePots = pots.filter((p) => p.status !== "closed");
  const totalValue = pots.reduce((sum, p) => sum + (p.estimatedValue ?? 0), 0);
  const unknownValueCount = pots.filter((p) => p.estimatedValue === null).length;

  const stats = [
    { label: "Total estimated value", value: formatCurrency(totalValue) },
    { label: "Pension pots tracked", value: String(pots.length) },
    { label: "Active pots", value: String(activePots.length) },
    { label: "Missing a value", value: String(unknownValueCount) },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-black/10 bg-white p-4 shadow-sm dark:border-white/10 dark:bg-neutral-900"
        >
          <p className="text-xs font-medium text-black/50 dark:text-white/50">{stat.label}</p>
          <p className="mt-1 text-xl font-semibold tabular-nums">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
