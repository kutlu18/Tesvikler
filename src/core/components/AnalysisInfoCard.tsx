import type { AnalysisInfoState } from "../../types/analysis";

interface AnalysisInfoCardProps {
  value: AnalysisInfoState;
  onChange: <K extends keyof AnalysisInfoState>(key: K, nextValue: AnalysisInfoState[K]) => void;
}

export default function AnalysisInfoCard({ value, onChange }: AnalysisInfoCardProps) {
  return (
    <section className="app-section p-5">
      <h3 className="text-base font-semibold text-slate-900">Analiz Bilgileri</h3>
      <p className="mt-1 text-sm text-slate-600">Bu alanlar analiz arşivi ve profil ekranında kullanılır.</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <label className="block text-sm">
          <span className="app-label">Analiz başlığı</span>
          <input
            className="app-input"
            value={value.title}
            onChange={(event) => onChange("title", event.target.value)}
            placeholder="Örn. Mayıs 2026 SGK analizi"
          />
        </label>

        <label className="block text-sm">
          <span className="app-label">Müşteri / firma adı</span>
          <input
            className="app-input"
            value={value.customerName}
            onChange={(event) => onChange("customerName", event.target.value)}
            placeholder="Firma unvanı"
          />
        </label>

        <label className="block text-sm">
          <span className="app-label">NACE kodu</span>
          <input
            className="app-input"
            value={value.customerNaceCode}
            onChange={(event) => onChange("customerNaceCode", event.target.value)}
            placeholder="Örn. 62.01"
          />
        </label>

        <label className="block text-sm">
          <span className="app-label">Müşteri vergi no</span>
          <input
            className="app-input"
            value={value.customerTaxNumber}
            onChange={(event) => onChange("customerTaxNumber", event.target.value)}
            placeholder="Opsiyonel"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <label className="block text-sm">
          <span className="app-label">Sektör</span>
          <input
            className="app-input"
            value={value.customerSector}
            onChange={(event) => onChange("customerSector", event.target.value)}
            placeholder="Opsiyonel sektör notu"
          />
        </label>

        <label className="block text-sm">
          <span className="app-label">Durum</span>
          <select
            className="app-input"
            value={value.status}
            onChange={(event) => onChange("status", event.target.value as AnalysisInfoState["status"])}
          >
            <option value="Taslak">Taslak</option>
            <option value="Tamamlandi">Tamamlandı</option>
            <option value="Raporlandi">Raporlandı</option>
            <option value="Arsivlendi">Arşivlendi</option>
          </select>
        </label>
      </div>

      <label className="mt-4 block text-sm">
        <span className="app-label">Not</span>
        <textarea
          className="app-input min-h-28"
          value={value.notes}
          onChange={(event) => onChange("notes", event.target.value)}
          placeholder="Müşteri notları, sonraki aksiyonlar veya görüşme detayları"
        />
      </label>
    </section>
  );
}
