import { KosgebSupportResult } from "../types";

interface KosgebResultCardProps {
  result: KosgebSupportResult;
}

const statusStyles: Record<KosgebSupportResult["status"], string> = {
  UYGUN: "border-emerald-200 bg-emerald-50/70",
  POTANSİYEL: "border-amber-200 bg-amber-50/70",
  "UYGUN DEĞİL / RİSKLİ": "border-rose-200 bg-rose-50/70",
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) {
    return null;
  }

  return (
    <div>
      <p className="text-sm font-semibold text-slate-800">{title}</p>
      <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
        {items.map((item) => (
          <li key={`${title}-${item}`}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default function KosgebResultCard({ result }: KosgebResultCardProps) {
  return (
    <article className={`rounded-2xl border p-5 shadow-sm transition hover:shadow-card ${statusStyles[result.status]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{result.supportName}</h3>
          <p className="text-sm text-slate-700">
            Durum: <span className="font-semibold">{result.status}</span>
          </p>
        </div>
        <div className="rounded-xl bg-white px-3 py-2 text-xs text-slate-700 shadow-sm">
          <p>
            <span className="font-semibold">Kurum:</span> {result.institution}
          </p>
          <p>
            <span className="font-semibold">Tür:</span> {result.supportType}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Kimler yararlanabilir?</span> {result.beneficiaries}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Desteklenen giderler:</span> {result.coveredExpenses}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Tahmini destek yapısı:</span> {result.estimatedSupportStructure}
          </p>
          <ListBlock title="Neden uygun?" items={result.whyEligible} />
          <ListBlock title="Destek nasıl alınır?" items={result.howToGet} />
        </div>
        <div className="space-y-3">
          <ListBlock title="Neden sağlanmadı?" items={result.whyNotEligible} />
          <ListBlock title="Nasıl sağlanabilir?" items={result.howToBecomeEligible} />
          <ListBlock title="Gerekli belgeler" items={result.requiredDocuments} />
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Sonraki aksiyon:</span> {result.nextAction}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Risk notu:</span> {result.riskNote}
          </p>
        </div>
      </div>
    </article>
  );
}
