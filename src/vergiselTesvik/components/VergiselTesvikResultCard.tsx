import { VergiselSupportResult } from "../types";

interface VergiselTesvikResultCardProps {
  result: VergiselSupportResult;
}

const statusStyles: Record<VergiselSupportResult["status"], string> = {
  UYGUN: "border-emerald-200 bg-emerald-50/70",
  POTANSIYEL: "border-amber-200 bg-amber-50/70",
  "UYGUN DEGIL / RISKLI": "border-rose-200 bg-rose-50/70",
};

function ListBlock({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;

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

export default function VergiselTesvikResultCard({ result }: VergiselTesvikResultCardProps) {
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
            <span className="font-semibold">Dayanak mevzuat:</span> {result.legalBasis}
          </p>
          <p>
            <span className="font-semibold">Vergi türü:</span> {result.taxType}
          </p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Kimler yararlanabilir?</span> {result.beneficiaryProfile}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Hangi faaliyet için uygundur?</span> {result.suitableActivity}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Sağladığı vergi avantajı:</span> {result.taxAdvantage}
          </p>
          <ListBlock title="Neden uygun?" items={result.whyEligible} />
          <ListBlock title="Nasıl uygulanır?" items={result.howToApply} />
        </div>

        <div className="space-y-3">
          <ListBlock title="Neden sağlanmadı?" items={result.whyNotEligible} />
          <ListBlock title="Nasıl sağlanabilir?" items={result.howToBecomeEligible} />
          <ListBlock title="Gerekli belgeler" items={result.requiredDocuments} />
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Beyanname / başvuru kanalı:</span> {result.applicationChannel}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Sonraki aksiyon:</span> {result.nextAction}
          </p>
          <p className="text-sm">
            <span className="font-semibold text-slate-800">Risk notu:</span> {result.riskNote}
          </p>
          <p className="text-xs text-slate-600">{result.sourceWarning}</p>
        </div>
      </div>
    </article>
  );
}
