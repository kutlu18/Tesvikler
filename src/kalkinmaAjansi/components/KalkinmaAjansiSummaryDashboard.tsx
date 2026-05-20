import { KalkinmaSummary } from "../types";

interface KalkinmaAjansiSummaryDashboardProps {
  summary: KalkinmaSummary;
}

const card = "rounded-xl border bg-white p-4 shadow-sm";

export default function KalkinmaAjansiSummaryDashboard({ summary }: KalkinmaAjansiSummaryDashboardProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article className={`${card} border-emerald-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Uygun destek sayisi</p>
        <p className="mt-2 text-3xl font-bold text-emerald-800">{summary.uygunCount}</p>
      </article>
      <article className={`${card} border-amber-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Potansiyel destek sayisi</p>
        <p className="mt-2 text-3xl font-bold text-amber-800">{summary.potansiyelCount}</p>
      </article>
      <article className={`${card} border-rose-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Riskli / uygun olmayan</p>
        <p className="mt-2 text-3xl font-bold text-rose-800">{summary.riskliCount}</p>
      </article>
      <article className={`${card} border-sky-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Acik cagri kontrolu gereken</p>
        <p className="mt-2 text-3xl font-bold text-sky-800">{summary.callCheckCount}</p>
      </article>
      <article className={`${card} border-slate-300`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Eksik belge sayisi</p>
        <p className="mt-2 text-3xl font-bold text-slate-800">{summary.missingDocumentCount}</p>
      </article>
      <article className={`${card} border-violet-200`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">KAYS hazirlik skoru</p>
        <p className="mt-2 text-3xl font-bold text-violet-800">{summary.kaysReadinessScore.score}</p>
        <p className="mt-1 text-xs text-violet-900">{summary.kaysReadinessScore.comment}</p>
      </article>
      <article className={`${card} border-cyan-200 sm:col-span-2 xl:col-span-2`}>
        <p className="text-xs font-semibold uppercase tracking-wide text-cyan-700">Kalkinma ajansi uygunluk skoru</p>
        <p className="mt-2 text-3xl font-bold text-cyan-800">{summary.kalkinmaAjansiUygunlukScore.score}</p>
        <p className="mt-1 text-xs text-cyan-900">{summary.kalkinmaAjansiUygunlukScore.comment}</p>
      </article>
    </section>
  );
}
