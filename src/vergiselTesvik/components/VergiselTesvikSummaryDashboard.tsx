import { VergiselSummary } from "../types";

interface VergiselTesvikSummaryDashboardProps {
  summary: VergiselSummary;
}

const card = "rounded-xl border bg-white p-4 shadow-sm";

export default function VergiselTesvikSummaryDashboard({ summary }: VergiselTesvikSummaryDashboardProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className={`${card} border-emerald-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Uygun vergisel tesvik</p>
        <p className="mt-2 text-3xl font-bold text-emerald-800">{summary.uygunCount}</p>
      </article>
      <article className={`${card} border-amber-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Potansiyel avantaj</p>
        <p className="mt-2 text-3xl font-bold text-amber-800">{summary.potansiyelCount}</p>
      </article>
      <article className={`${card} border-rose-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Riskli / uygun olmayan</p>
        <p className="mt-2 text-3xl font-bold text-rose-800">{summary.riskliCount}</p>
      </article>
      <article className={`${card} border-sky-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">KDV firsati sayisi</p>
        <p className="mt-2 text-3xl font-bold text-sky-800">{summary.kdvOpportunityCount}</p>
      </article>
      <article className={`${card} border-indigo-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Bordro optimizasyonu</p>
        <p className="mt-2 text-3xl font-bold text-indigo-800">{summary.payrollOptimizationCount}</p>
      </article>
      <article className={`${card} border-slate-300`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Eksik belge sayisi</p>
        <p className="mt-2 text-3xl font-bold text-slate-800">{summary.missingDocumentCount}</p>
      </article>
      <article className={`${card} border-cyan-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Vergisel uygunluk skoru</p>
        <p className="mt-2 text-3xl font-bold text-cyan-800">{summary.vergiselUygunlukScore.score}</p>
        <p className="mt-1 text-xs text-cyan-900">{summary.vergiselUygunlukScore.comment}</p>
      </article>
      <article className={`${card} border-violet-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Belge/muhasebe hazirlik skoru</p>
        <p className="mt-2 text-3xl font-bold text-violet-800">{summary.belgeMuhasebeHazirlikScore.score}</p>
        <p className="mt-1 text-xs text-violet-900">{summary.belgeMuhasebeHazirlikScore.comment}</p>
      </article>
    </section>
  );
}
