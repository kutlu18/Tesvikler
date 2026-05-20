import { repairTurkishText } from "../../core/text/repairTurkishText";
import { TicaretSummary } from "../types";

interface TicaretSummaryDashboardProps { summary: TicaretSummary; }
const card = "rounded-xl border bg-white p-4 shadow-sm";
export default function TicaretSummaryDashboard({ summary }: TicaretSummaryDashboardProps) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <article className={`${card} border-emerald-200`}><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Uygun destek sayısı</p><p className="mt-2 text-3xl font-bold text-emerald-800">{summary.uygunCount}</p></article>
      <article className={`${card} border-amber-200`}><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Potansiyel destek sayısı</p><p className="mt-2 text-3xl font-bold text-amber-800">{summary.potansiyelCount}</p></article>
      <article className={`${card} border-rose-200`}><p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Riskli / uygun olmayan</p><p className="mt-2 text-3xl font-bold text-rose-800">{summary.riskliCount}</p></article>
      <article className={`${card} border-slate-200`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Eksik belge sayısı</p><p className="mt-2 text-3xl font-bold text-slate-900">{summary.missingDocumentCount}</p></article>
      <article className={`${card} border-sky-200`}><p className="text-xs font-semibold uppercase tracking-wide text-sky-700">DYS hazırlık skoru</p><p className="mt-2 text-3xl font-bold text-sky-800">{summary.dysReadiness.score}</p><p className="mt-1 text-xs text-sky-900">{repairTurkishText(summary.dysReadiness.comment)}</p></article>
      <article className={`${card} border-violet-200`}><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">İhracat destek uygunluk</p><p className="mt-2 text-3xl font-bold text-violet-800">{summary.exportSuitability.score}</p><p className="mt-1 text-xs text-violet-900">{repairTurkishText(summary.exportSuitability.comment)}</p></article>
    </section>
  );
}
