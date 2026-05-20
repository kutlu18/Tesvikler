interface AnalysisActionBarProps {
  onStart: () => void;
  onSave: () => Promise<void> | void;
  onReset: () => void;
  onReportPlaceholder?: () => Promise<void> | void;
  isSaving?: boolean;
  saveMessage?: string | null;
  reportDisabled?: boolean;
  startDisabled?: boolean;
}

export default function AnalysisActionBar({
  onStart,
  onSave,
  onReset,
  onReportPlaceholder,
  isSaving = false,
  saveMessage,
  reportDisabled = false,
  startDisabled = false,
}: AnalysisActionBarProps) {
  const isReportDisabled = reportDisabled || !onReportPlaceholder;

  return (
    <section className="app-section p-5">
      <h3 className="text-base font-semibold text-slate-900">İşlemler</h3>
      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
        <button
          type="button"
          onClick={onStart}
          disabled={startDisabled}
          className="btn-primary"
        >
          Analizi Başlat
        </button>
        <button
          type="button"
          onClick={() => void onSave()}
          disabled={isSaving}
          className="rounded-xl border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-blue-800 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSaving ? "Kaydediliyor..." : "Analizi Kaydet"}
        </button>
        <button
          type="button"
          onClick={onReset}
          className="btn-secondary"
        >
          Analizi Sıfırla
        </button>
        <button
          type="button"
          disabled={isReportDisabled}
          onClick={() => void onReportPlaceholder?.()}
          className={`rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
            isReportDisabled
              ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-500"
              : "border-blue-200 bg-blue-50 text-blue-800 hover:bg-blue-100"
          }`}
          title={
            isReportDisabled
              ? "Rapor çıktısı bu modülde kullanılamıyor."
              : "Raporu yazdırabilir veya PDF olarak kaydedebilirsiniz."
          }
        >
          PDF / Rapor çıktısı al
        </button>
      </div>

      {saveMessage ? <p className="mt-3 text-sm text-slate-600">{saveMessage}</p> : null}
    </section>
  );
}
