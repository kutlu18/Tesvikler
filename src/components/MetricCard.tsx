import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
  tone: "blue" | "emerald" | "amber" | "slate";
}

const toneClasses: Record<MetricCardProps["tone"], string> = {
  blue: "bg-blue-50 text-blue-700 ring-blue-100",
  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-100",
  amber: "bg-amber-50 text-amber-700 ring-amber-100",
  slate: "bg-slate-100 text-slate-700 ring-slate-200",
};

export default function MetricCard({ title, value, description, icon: Icon, tone }: MetricCardProps) {
  return (
    <article className="group rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-card">
      <div className="flex items-start justify-between gap-4">
        <div className={`inline-flex rounded-2xl p-3 ring-1 ${toneClasses[tone]}`}>
          <Icon className="h-5 w-5" />
        </div>
        <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">{title}</span>
      </div>
      <div className="mt-5 text-3xl font-bold tracking-tight text-slate-900">{value}</div>
      <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
    </article>
  );
}
