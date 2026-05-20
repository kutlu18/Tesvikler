import { repairTurkishText } from "../../core/text/repairTurkishText";
import { TubitakSummary } from "../types";

interface TubitakSummaryDashboardProps {
  summary: TubitakSummary;
}

const card = "rounded-xl border bg-white p-4 shadow-sm";

export default function TubitakSummaryDashboard({ summary }: TubitakSummaryDashboardProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
      <article className={`${card} border-emerald-200`}><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Uygun destek sayısı</p><p className="mt-2 text-3xl font-bold text-emerald-800">{summary.uygunCount}</p></article>
      <article className={`${card} border-amber-200`}><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Potansiyel destek sayısı</p><p className="mt-2 text-3xl font-bold text-amber-800">{summary.potansiyelCount}</p></article>
      <article className={`${card} border-rose-200`}><p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Riskli / uygun olmayan</p><p className="mt-2 text-3xl font-bold text-rose-800">{summary.riskliCount}</p></article>
      <article className={`${card} border-sky-200`}><p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Ar-Ge uygunluk skoru</p><p className="mt-2 text-3xl font-bold text-sky-800">{summary.argeScore}</p><p className="mt-1 text-xs text-sky-900">{repairTurkishText(summary.argeScoreComment)}</p></article>
      <article className={`${card} border-violet-200`}><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Çağrı kontrolü gereken</p><p className="mt-2 text-3xl font-bold text-violet-800">{summary.callCheckCount}</p></article>
    </section>
  );
}
