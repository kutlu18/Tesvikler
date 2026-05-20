import { SgkTesvikSonucu } from "../types";

interface SgkResultCardProps {
  result: SgkTesvikSonucu;
}

const statusStyleMap: Record<SgkTesvikSonucu["durum"], string> = {
  UYGUN: "border-emerald-300 bg-emerald-50",
  POTANSIYEL: "border-amber-300 bg-amber-50",
  "UYGUN DEGIL": "border-rose-300 bg-rose-50",
  "UYGUN DEGIL / RISKLI": "border-rose-300 bg-rose-50",
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

export default function SgkResultCard({ result }: SgkResultCardProps) {
  return (
    <article className={`rounded-xl border p-5 shadow-sm ${statusStyleMap[result.durum]}`}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">{result.ad}</h3>
          <p className="text-sm text-slate-700">
            Durum: <span className="font-semibold">{result.durum}</span>
          </p>
        </div>
      </div>

      <div className="mt-3 space-y-3">
        <p className="text-sm">
          <span className="font-semibold text-slate-800">Mevzuat:</span> {result.mevzuat}
        </p>
        <p className="text-sm">
          <span className="font-semibold text-slate-800">Fayda:</span> {result.fayda}
        </p>
        <ListBlock title="Gerekce" items={result.gerekce} />
        <ListBlock title="Sonraki aksiyon" items={result.aksiyon} />
        <ListBlock title="Risk notu" items={result.risk_notu} />
      </div>
    </article>
  );
}

