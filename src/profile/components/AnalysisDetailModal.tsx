import { useEffect, useState } from "react";
import { addAnalysisNote, listAnalysisNotes } from "../../db/analysisService";
import { recordActivity } from "../../db/activityLogService";
import { analysisTypeLabels, type AnalysisNoteRecord, type AnalysisRecord } from "../../types/analysis";
import { useAuth } from "../../auth/useAuth";

interface AnalysisDetailModalProps {
  analysis: AnalysisRecord | null;
  onClose: () => void;
}

export default function AnalysisDetailModal({ analysis, onClose }: AnalysisDetailModalProps) {
  const { user } = useAuth();
  const [notes, setNotes] = useState<AnalysisNoteRecord[]>([]);
  const [newNote, setNewNote] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!analysis || !user) {
      return;
    }

    setIsLoading(true);
    void listAnalysisNotes(user.id, analysis.id)
      .then((items) => setNotes(items))
      .finally(() => setIsLoading(false));

    void recordActivity({
      userId: user.id,
      actionType: "analysis_view",
      module: analysis.analysisType,
      entityType: "analysis",
      entityId: analysis.id,
      description: `${analysis.title || "Kayıtlı analiz"} detayı görüntülendi.`,
    });
  }, [analysis, user]);

  if (!analysis) {
    return null;
  }

  const handleAddNote = async () => {
    if (!user || !analysis.id || !newNote.trim()) {
      return;
    }

    const created = await addAnalysisNote(user.id, analysis.id, newNote.trim());
    setNotes((prev) => [created, ...prev]);
    setNewNote("");

    await recordActivity({
      userId: user.id,
      actionType: "analysis_note",
      module: analysis.analysisType,
      entityType: "analysis_note",
      entityId: analysis.id,
      description: "Analize yeni not eklendi.",
    });
  };

  const renderResultCard = (item: Record<string, unknown>, index: number) => {
    const title = String(item.ad ?? item.name ?? item.title ?? `Sonuç ${index + 1}`);

    return (
      <div key={`${title}-${index}`} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
        <dl className="mt-3 grid gap-2 text-sm text-slate-700 md:grid-cols-2">
          {Object.entries(item).map(([key, value]) => (
            <div key={key}>
              <dt className="font-medium text-slate-900">{humanizeKey(key)}</dt>
              <dd>{renderValue(value)}</dd>
            </div>
          ))}
        </dl>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-slate-950/60 px-4 py-8">
      <div className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              {analysisTypeLabels[analysis.analysisType]}
            </span>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">{analysis.title || "Kayıtlı analiz"}</h2>
            <p className="mt-1 text-sm text-slate-600">
              {analysis.customerName || "Müşteri belirtilmedi"} • {new Date(analysis.createdAt).toLocaleString("tr-TR")}
            </p>
          </div>
          <button type="button" onClick={onClose} className="btn-secondary">
            Kapat
          </button>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <section className="space-y-6">
            <Panel title="Özet">
              <div className="grid gap-4 md:grid-cols-2">
                <Summary label="Analiz tipi" value={analysisTypeLabels[analysis.analysisType]} />
                <Summary label="NACE" value={analysis.customerNaceCode || "Belirtilmedi"} />
                <Summary label="Uygun destek" value={String(analysis.eligibleCount)} />
                <Summary label="Potansiyel destek" value={String(analysis.potentialCount)} />
                <Summary label="Riskli destek" value={String(analysis.riskyCount)} />
                <Summary label="Durum" value={analysis.status} />
              </div>
            </Panel>

            <Panel title="Form Cevapları">
              <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                {JSON.stringify(analysis.formData, null, 2)}
              </pre>
            </Panel>

            <Panel title="Sonuçlar">
              <ResultGroup title="Uygun Destekler" items={analysis.results.uygun} renderResultCard={renderResultCard} />
              <ResultGroup title="Potansiyel Destekler" items={analysis.results.potansiyel} renderResultCard={renderResultCard} />
              <ResultGroup title="Riskli / Uygun Olmayan Destekler" items={analysis.results.riskli} renderResultCard={renderResultCard} />
            </Panel>
          </section>

          <section className="space-y-6">
            <Panel title="Belgeler">
              <p className="text-sm text-slate-600">
                Belge yükleme altyapısı hazırlandı. Bu sürümde alan placeholder olarak bırakıldı.
              </p>
            </Panel>

            <Panel title="Notlar">
              <div className="space-y-3">
                <textarea
                  className="app-input min-h-28 w-full"
                  value={newNote}
                  onChange={(event) => setNewNote(event.target.value)}
                  placeholder="Bu analiz için ekip içi not ekleyin"
                />
                <button type="button" onClick={() => void handleAddNote()} className="btn-primary">
                  Not Ekle
                </button>
                {isLoading ? <p className="text-sm text-slate-600">Notlar yükleniyor...</p> : null}
                {notes.map((note) => (
                  <div key={note.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
                    <div className="font-medium text-slate-900">{new Date(note.createdAt).toLocaleString("tr-TR")}</div>
                    <p className="mt-1 whitespace-pre-wrap">{note.note}</p>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel title="Sistem Notları">
              <p className="text-sm text-slate-600">
                Bu kayıt ön değerlendirme niteliğindedir. Nihai uygunluk ve beyan etkileri ilgili kurum koşulları ile ayrıca doğrulanmalıdır.
              </p>
            </Panel>
          </section>
        </div>
      </div>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="text-lg font-bold text-slate-900">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Summary({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
      <div className="mt-1 text-sm font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function ResultGroup({
  title,
  items,
  renderResultCard,
}: {
  title: string;
  items: Array<Record<string, unknown>>;
  renderResultCard: (item: Record<string, unknown>, index: number) => React.ReactNode;
}) {
  return (
    <div className="space-y-3">
      <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
      {items.length ? items.map(renderResultCard) : <p className="text-sm text-slate-600">Bu grupta kayıt bulunmuyor.</p>}
    </div>
  );
}

function renderValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.join(", ");
  }

  if (typeof value === "boolean") {
    return value ? "Evet" : "Hayır";
  }

  if (value && typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value ?? "-");
}

function humanizeKey(input: string) {
  return input
    .replace(/_/g, " ")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}
