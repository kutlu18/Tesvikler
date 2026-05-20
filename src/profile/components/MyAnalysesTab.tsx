import { FolderOpenDot } from "lucide-react";
import { analysisTypeLabels, type AnalysisFilters, type AnalysisRecord } from "../../types/analysis";

interface MyAnalysesTabProps {
  analyses: AnalysisRecord[];
  filters: AnalysisFilters;
  isLoading: boolean;
  onFilterChange: (patch: Partial<AnalysisFilters>) => void;
  onView: (analysis: AnalysisRecord) => void;
  onReopen: (analysis: AnalysisRecord) => void;
  onArchive: (analysis: AnalysisRecord) => void;
  onDelete: (analysis: AnalysisRecord) => void;
  onDuplicate: (analysis: AnalysisRecord) => void;
  onReport: (analysis: AnalysisRecord) => void;
}

export default function MyAnalysesTab({
  analyses,
  filters,
  isLoading,
  onFilterChange,
  onView,
  onReopen,
  onArchive,
  onDelete,
  onDuplicate,
  onReport,
}: MyAnalysesTabProps) {
  return (
    <div className="space-y-4">
      <section className="app-section p-5">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <input
            className="app-input"
            placeholder="Başlık, firma, NACE veya not ara"
            value={filters.search ?? ""}
            onChange={(event) => onFilterChange({ search: event.target.value })}
          />
          <select
            className="app-input"
            value={filters.analysisType ?? "all"}
            onChange={(event) => onFilterChange({ analysisType: event.target.value as AnalysisFilters["analysisType"] })}
          >
            <option value="all">Tüm analiz tipleri</option>
            {Object.entries(analysisTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
          <select
            className="app-input"
            value={filters.status ?? "all"}
            onChange={(event) => onFilterChange({ status: event.target.value as AnalysisFilters["status"] })}
          >
            <option value="all">Tüm durumlar</option>
            <option value="Taslak">Taslak</option>
            <option value="Tamamlandi">Tamamlandı</option>
            <option value="Raporlandi">Raporlandı</option>
            <option value="Arsivlendi">Arşivlendi</option>
          </select>
          <input
            className="app-input"
            placeholder="Firma / müşteri adı"
            value={filters.customerName ?? ""}
            onChange={(event) => onFilterChange({ customerName: event.target.value })}
          />
        </div>
      </section>

      {isLoading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={`skeleton-${index}`} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="h-4 w-36 animate-pulse rounded bg-slate-200" />
              <div className="mt-3 h-6 w-2/3 animate-pulse rounded bg-slate-200" />
              <div className="mt-2 h-4 w-1/2 animate-pulse rounded bg-slate-200" />
              <div className="mt-5 grid gap-2 sm:grid-cols-2">
                <div className="h-14 animate-pulse rounded bg-slate-100" />
                <div className="h-14 animate-pulse rounded bg-slate-100" />
              </div>
            </div>
          ))}
        </div>
      ) : analyses.length ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {analyses.map((analysis) => (
            <article key={analysis.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-card">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                    {analysisTypeLabels[analysis.analysisType]}
                  </div>
                  <h3 className="mt-3 text-lg font-bold text-slate-900">{analysis.title || "Başlıksız analiz"}</h3>
                  <p className="mt-1 text-sm text-slate-600">{analysis.customerName || "Müşteri belirtilmedi"}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">{analysis.status}</span>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Meta label="NACE" value={analysis.customerNaceCode || "-"} />
                <Meta label="Oluşturulma" value={new Date(analysis.createdAt).toLocaleString("tr-TR")} />
                <Meta label="Güncellenme" value={new Date(analysis.updatedAt).toLocaleString("tr-TR")} />
                <Meta label="Not" value={analysis.notes || "-"} />
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <Badge tone="green" text={`Uygun ${analysis.eligibleCount}`} />
                <Badge tone="amber" text={`Potansiyel ${analysis.potentialCount}`} />
                <Badge tone="rose" text={`Riskli ${analysis.riskyCount}`} />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <ActionButton label="Detay Gör" onClick={() => onView(analysis)} />
                <ActionButton label="Yeniden Aç" onClick={() => onReopen(analysis)} />
                <ActionButton label="Kopyala" onClick={() => onDuplicate(analysis)} />
                <ActionButton label="Arşivle" onClick={() => onArchive(analysis)} />
                <ActionButton label="Sil" tone="danger" onClick={() => onDelete(analysis)} />
                <ActionButton label="PDF Al" onClick={() => onReport(analysis)} />
              </div>
            </article>
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto inline-flex rounded-2xl bg-blue-50 p-3 text-blue-700">
            <FolderOpenDot className="h-6 w-6" />
          </div>
          <h3 className="mt-4 text-lg font-semibold text-slate-900">Henüz kayıtlı analiz bulunmuyor</h3>
          <p className="mt-2 text-sm text-slate-600">
            İlk analizinizi başlatmak için bir destek modülü seçin ve analizi kaydedin.
          </p>
        </div>
      )}
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-medium text-slate-900">{value}</div>
    </div>
  );
}

function Badge({ tone, text }: { tone: "green" | "amber" | "rose"; text: string }) {
  const className =
    tone === "green"
      ? "bg-emerald-50 text-emerald-700"
      : tone === "amber"
        ? "bg-amber-50 text-amber-700"
        : "bg-rose-50 text-rose-700";

  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${className}`}>{text}</span>;
}

function ActionButton({
  label,
  onClick,
  tone = "default",
}: {
  label: string;
  onClick: () => void;
  tone?: "default" | "danger";
}) {
  const className =
    tone === "danger"
      ? "border-rose-200 text-rose-700 hover:bg-rose-50"
      : "border-slate-300 text-slate-700 hover:bg-slate-50";

  return (
    <button type="button" onClick={onClick} className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${className}`}>
      {label}
    </button>
  );
}
