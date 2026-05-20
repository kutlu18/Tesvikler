import { repairTurkishText } from "../../core/text/repairTurkishText";
import { TicaretSupportResult } from "../types";

interface TicaretResultCardProps {
  result: TicaretSupportResult;
}

const statusStyles: Record<TicaretSupportResult["status"], string> = {
  UYGUN: "border-emerald-200 bg-emerald-50/70",
  POTANSİYEL: "border-amber-200 bg-amber-50/70",
  "UYGUN DEĞİL / RİSKLİ": "border-rose-200 bg-rose-50/70",
};

const classLabels: Record<TicaretSupportResult["supportClass"], string> = {
  MAL: "Mal ihracatı",
  EIHRACAT: "E-ihracat",
  HIZMET: "Hizmet ihracatı",
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={`${title}-${item}`}>{repairTurkishText(item)}</li>
        ))}
      </ul>
    </div>
  );
}

export default function TicaretResultCard({ result }: TicaretResultCardProps) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-card ${statusStyles[result.status]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{repairTurkishText(result.supportName)}</h3>
          <p className="text-sm text-slate-700">
            Durum: <span className="font-semibold">{repairTurkishText(result.status)}</span>
          </p>
          <p className="text-sm text-slate-700">
            Destek sınıfı: <span className="font-semibold">{classLabels[result.supportClass]}</span>
          </p>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
          <p>
            <span className="font-semibold">Kurum:</span> {repairTurkishText(result.institution)}
          </p>
          <p>
            <span className="font-semibold">Mevzuat:</span> {repairTurkishText(result.legalBasis)}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Kimler başvurabilir?</span> {repairTurkishText(result.applicantProfile)}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Desteklenen giderler:</span> {repairTurkishText(result.supportedExpenses)}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Tahmini destek yapısı:</span> {repairTurkishText(result.estimatedStructure)}
          </p>
          <ListBlock title="Neden uygun?" items={result.whyEligible} />
          <ListBlock title="Destek nasıl alınır?" items={result.howToGet} />
        </div>
        <div className="space-y-3">
          <ListBlock title="Neden sağlanmadı?" items={result.whyNotEligible} />
          <ListBlock title="Nasıl sağlanabilir?" items={result.howToBecomeEligible} />
          <ListBlock title="Gerekli belgeler" items={result.requiredDocuments} />
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Başvuru kanalı:</span> {repairTurkishText(result.applicationChannel)}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Sonraki aksiyon:</span> {repairTurkishText(result.nextAction)}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Risk notu:</span> {repairTurkishText(result.riskNote)}
          </p>
        </div>
      </div>
    </article>
  );
}
