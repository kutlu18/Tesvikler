import { SgkEvaluationSummary } from "../types";

interface SgkSummaryDashboardProps {
  summary: SgkEvaluationSummary;
}

const cardClass = "rounded-xl border bg-white p-4 shadow-sm";

export default function SgkSummaryDashboard({ summary }: SgkSummaryDashboardProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className={`${cardClass} border-emerald-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Uygun tesvik sayisi</p>
        <p className="mt-2 text-3xl font-bold text-emerald-800">{summary.uygunCount}</p>
      </article>
      <article className={`${cardClass} border-amber-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Potansiyel tesvik sayisi</p>
        <p className="mt-2 text-3xl font-bold text-amber-800">{summary.potansiyelCount}</p>
      </article>
      <article className={`${cardClass} border-rose-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Riskli / uygun degil</p>
        <p className="mt-2 text-3xl font-bold text-rose-800">{summary.riskliCount}</p>
      </article>
      <article className={`${cardClass} border-slate-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Toplam tesvik</p>
        <p className="mt-2 text-3xl font-bold text-slate-900">{summary.totalCount}</p>
      </article>
    </section>
  );
}

