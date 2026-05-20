import { KosgebEvaluationSummary } from "../types";

interface KosgebSummaryDashboardProps {
  summary: KosgebEvaluationSummary;
}

const itemClassName = "rounded-xl border bg-white p-4 shadow-sm";

export default function KosgebSummaryDashboard({ summary }: KosgebSummaryDashboardProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className={`${itemClassName} border-emerald-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Uygun destek sayısı</p>
        <p className="mt-2 text-3xl font-bold text-emerald-800">{summary.uygunCount}</p>
      </article>
      <article className={`${itemClassName} border-amber-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Potansiyel destek sayısı</p>
        <p className="mt-2 text-3xl font-bold text-amber-800">{summary.potansiyelCount}</p>
      </article>
      <article className={`${itemClassName} border-rose-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Riskli / uygun olmayan</p>
        <p className="mt-2 text-3xl font-bold text-rose-800">{summary.riskliCount}</p>
      </article>
      <article className={`${itemClassName} border-slate-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Toplam tahmini fırsat</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{summary.totalOpportunityCount}</p>
      </article>
    </section>
  );
}
