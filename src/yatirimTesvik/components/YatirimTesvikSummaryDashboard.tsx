import { repairTurkishText } from "../../core/text/repairTurkishText";
import { YatirimTesvikSummary } from "../types";

interface YatirimTesvikSummaryDashboardProps { summary: YatirimTesvikSummary; }
const cardClass = "rounded-xl border bg-white p-4 shadow-sm";
export default function YatirimTesvikSummaryDashboard({ summary }: YatirimTesvikSummaryDashboardProps) {
  const riskTone = summary.preCertificateSpendingRisk === "Yüksek" ? "text-rose-800" : summary.preCertificateSpendingRisk === "Orta" ? "text-amber-800" : "text-emerald-800";
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <article className={`${cardClass} border-emerald-200`}><p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Uygun teşvik türü</p><p className="mt-2 text-3xl font-bold text-emerald-800">{summary.uygunCount}</p></article>
      <article className={`${cardClass} border-amber-200`}><p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Potansiyel teşvik türü</p><p className="mt-2 text-3xl font-bold text-amber-800">{summary.potansiyelCount}</p></article>
      <article className={`${cardClass} border-rose-200`}><p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Riskli / uygun olmayan</p><p className="mt-2 text-3xl font-bold text-rose-800">{summary.riskliCount}</p></article>
      <article className={`${cardClass} border-slate-200`}><p className="text-xs font-semibold uppercase tracking-wide text-slate-700">Belge öncesi harcama riski</p><p className={`mt-2 text-2xl font-bold ${riskTone}`}>{repairTurkishText(summary.preCertificateSpendingRisk)}</p></article>
      <article className={`${cardClass} border-sky-200`}><p className="text-xs font-semibold uppercase tracking-wide text-sky-700">E-TUYS hazırlık skoru</p><p className="mt-2 text-3xl font-bold text-sky-800">{summary.etuysReadiness.score}</p><p className="mt-1 text-xs text-sky-900">{repairTurkishText(summary.etuysReadiness.comment)}</p></article>
      <article className={`${cardClass} border-violet-200`}><p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Teşvik uygunluk skoru</p><p className="mt-2 text-3xl font-bold text-violet-800">{summary.suitabilityScore.score}</p><p className="mt-1 text-xs text-violet-900">{repairTurkishText(summary.suitabilityScore.comment)}</p></article>
    </section>
  );
}
