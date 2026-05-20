import { ReactNode, useMemo, useRef, useState } from "react";
import { buildInitialWorkspaceState, useAnalysisWorkspace } from "../core/analysis/useAnalysisWorkspace";
import AnalysisActionBar from "../core/components/AnalysisActionBar";
import AnalysisInfoCard from "../core/components/AnalysisInfoCard";
import type { AnalysisInfoState } from "../types/analysis";
import SgkQuestionSection from "./components/SgkQuestionSection";
import SgkResultCard from "./components/SgkResultCard";
import SgkSummaryDashboard from "./components/SgkSummaryDashboard";
import { evaluateSgkTesvikleri, summarizeSgkResults } from "./logic/evaluateSgkTesvikleri";
import { AdayCinsiyet, SgkFormState, createInitialSgkFormState } from "./types";

interface FieldProps {
  label: ReactNode;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="block rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
      <span className="mb-2 block font-medium">{label}</span>
      {children}
    </div>
  );
}

interface BinaryFieldProps {
  label: ReactNode;
  value: boolean;
  onChange: (value: boolean) => void;
}

function BinaryField({ label, value, onChange }: BinaryFieldProps) {
  return (
    <Field label={label}>
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange(true);
          }}
          className={`px-4 py-2 text-sm ${value ? "bg-brand-700 text-white" : "text-slate-700"}`}
        >
          Evet
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange(false);
          }}
          className={`px-4 py-2 text-sm ${!value ? "bg-brand-700 text-white" : "text-slate-700"}`}
        >
          Hayir
        </button>
      </div>
    </Field>
  );
}

const adayCinsiyetleri: AdayCinsiyet[] = ["Kadin", "Erkek", "Belirtmek istemiyor / bilinmiyor"];
const newHireInfoText =
  "Bu soru, SGK tesvik analizinde aday bazli hesaplama yapilip yapilmayacagini belirler. Evet secilirse alttaki aday sorulari acilir ve tesvik uygunlugu bu bilgilere gore degerlendirilir.";

export default function SgkEligibilityPage() {
  const initialWorkspace = buildInitialWorkspaceState<SgkFormState>("sgk", createInitialSgkFormState);
  const [form, setForm] = useState<SgkFormState>(initialWorkspace.form);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfoState>(initialWorkspace.info);
  const resultsSectionRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => evaluateSgkTesvikleri(form), [form]);
  const summary = useMemo(() => summarizeSgkResults(results), [results]);

  const grouped = useMemo(
    () => ({
      uygun: results.filter((item) => item.durum === "UYGUN"),
      potansiyel: results.filter((item) => item.durum === "POTANSIYEL"),
      riskli: results.filter((item) => item.durum !== "UYGUN" && item.durum !== "POTANSIYEL"),
    }),
    [results]
  );

  const updateField = <K extends keyof SgkFormState>(key: K, value: SgkFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBoolean = (key: keyof SgkFormState, value: boolean) => {
    updateField(key, value as SgkFormState[typeof key]);
  };

  const setNumber = (key: keyof SgkFormState, value: number) => {
    updateField(key, (Number.isNaN(value) ? 0 : value) as SgkFormState[typeof key]);
  };

  const selectZeroValue = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === "0") {
      requestAnimationFrame(() => {
        event.target.select();
      });
    }
  };

  const setString = (key: keyof SgkFormState, value: string) => {
    updateField(key, value as SgkFormState[typeof key]);
  };

  const { setInfoField, clearInfo, isSaving, saveMessage, handleSave, handleReportPlaceholder } = useAnalysisWorkspace({
    analysisType: "sgk",
    info: analysisInfo,
    setInfo: setAnalysisInfo,
    formData: form as unknown as Record<string, unknown>,
    results: {
      uygun: grouped.uygun as unknown as Array<Record<string, unknown>>,
      potansiyel: grouped.potansiyel as unknown as Array<Record<string, unknown>>,
      riskli: grouped.riskli as unknown as Array<Record<string, unknown>>,
    },
    scores: summary as unknown as Record<string, unknown>,
    defaultTitle: "SGK analizi",
  });

  const runAnalysis = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };
  const resetAnalysis = () => {
    setForm(createInitialSgkFormState());
    clearInfo();
  };

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">SGK / Istihdam / Bordro Tesvikleri On Uygunluk Araci</h1>
          <p className="mt-1 text-sm text-slate-700">
            Musteri gorusmesinde tek ekranda on degerlendirme yapabilmek icin tasarlanmistir.
          </p>
        </div>
      </header>

      <AnalysisInfoCard value={analysisInfo} onChange={setInfoField} />

      <SgkSummaryDashboard summary={summary} />

      <SgkQuestionSection title="1) Isyeri Genel Bilgileri">
        <BinaryField label="Isyeri ozel sektor isvereni mi?" value={form.ozel_sektor} onChange={(v) => setBoolean("ozel_sektor", v)} />
        <BinaryField label="Isyeri imalat sektorunde mi?" value={form.imalat} onChange={(v) => setBoolean("imalat", v)} />
        <BinaryField
          label="SGK borcu yok mu veya yapilandirilmis mi?"
          value={form.sgk_borcu_yok}
          onChange={(v) => setBoolean("sgk_borcu_yok", v)}
        />
        <BinaryField
          label="MUHSGK / prim belgeleri suresinde veriliyor mu?"
          value={form.bildirgeler_suresinde}
          onChange={(v) => setBoolean("bildirgeler_suresinde", v)}
        />
        <BinaryField
          label="SGK primleri suresinde odeniyor mu?"
          value={form.primler_suresinde}
          onChange={(v) => setBoolean("primler_suresinde", v)}
        />
        <BinaryField
          label="Kayit disi/sahte sigortali riski yok mu?"
          value={form.kayit_disi_risk_yok}
          onChange={(v) => setBoolean("kayit_disi_risk_yok", v)}
        />
        <BinaryField
          label="Is kamu ihalesi veya kamu idaresine ait ozel bina insaati kapsaminda mi?"
          value={form.kamu_ihalesi_is}
          onChange={(v) => setBoolean("kamu_ihalesi_is", v)}
        />
        <Field label="Toplam sigortali calisan sayisi">
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.calisan_sayisi}
            onFocus={selectZeroValue}
            onChange={(e) => setNumber("calisan_sayisi", Number(e.target.value))}
          />
        </Field>
        <Field label="Son 6 ay / ilgili donem ortalama sigortali sayisi">
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.ortalama_calisan_sayisi}
            onFocus={selectZeroValue}
            onChange={(e) => setNumber("ortalama_calisan_sayisi", Number(e.target.value))}
          />
        </Field>
      </SgkQuestionSection>

      <SgkQuestionSection title="2) Yatirim, Yurt Disi ve Ozel Belge Durumu">
        <BinaryField
          label="Yatirim Tesvik Belgesi var mi?"
          value={form.yatirim_tesvik_belgesi}
          onChange={(v) => setBoolean("yatirim_tesvik_belgesi", v)}
        />
        <BinaryField
          label="Yatirim tamamlandi mi / tamamlama vizesi asamasinda mi?"
          value={form.ytb_tamamlama_vizesi}
          onChange={(v) => setBoolean("ytb_tamamlama_vizesi", v)}
        />
        <BinaryField
          label="Yurt disina sigortali personel gonderiliyor mu?"
          value={form.yurtdisina_personel_gonderiyor}
          onChange={(v) => setBoolean("yurtdisina_personel_gonderiyor", v)}
        />
        <BinaryField
          label="Ar-Ge veya tasarim merkezi belgesi var mi?"
          value={form.arge_tasarim_merkezi}
          onChange={(v) => setBoolean("arge_tasarim_merkezi", v)}
        />
        <BinaryField label="Teknokent faaliyeti var mi?" value={form.teknokent} onChange={(v) => setBoolean("teknokent", v)} />
        <BinaryField
          label="Ar-Ge / tasarim / destek personeli calisiyor mu?"
          value={form.arge_personeli_var}
          onChange={(v) => setBoolean("arge_personeli_var", v)}
        />
        <BinaryField
          label="Kultur yatirim/girisim belgesi var mi?"
          value={form.kultur_belgesi}
          onChange={(v) => setBoolean("kultur_belgesi", v)}
        />
        <BinaryField
          label="Isyeri cok tehlikeli sinifta mi?"
          value={form.cok_tehlikeli}
          onChange={(v) => setBoolean("cok_tehlikeli", v)}
        />
        <BinaryField
          label="Son 3 yilda olumlu veya surekli is goremezlikli kaza yasanmadi mi?"
          value={form.is_kazasi_yok}
          onChange={(v) => setBoolean("is_kazasi_yok", v)}
        />
      </SgkQuestionSection>

      <SgkQuestionSection title="3) Yeni Ise Alinacak / Incelenecek Aday Bilgileri">
        <BinaryField
          label={
            <span className="inline-flex items-center gap-2">
              Yeni ise alim yapilacak mi veya aday incelenecek mi?
              <span className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Yeni ise alim sorusu aciklamasi"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  i
                </button>
                <span className="pointer-events-none absolute left-0 top-7 z-20 hidden w-80 rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-700 shadow-lg group-hover:block group-focus-within:block">
                  {newHireInfoText}
                </span>
              </span>
            </span>
          }
          value={form.yeni_ise_alim_var}
          onChange={(v) => setBoolean("yeni_ise_alim_var", v)}
        />

        {form.yeni_ise_alim_var ? (
          <>
            <Field label="Aday yasi">
              <input
                type="number"
                min={0}
                className="w-full rounded-lg border border-slate-300 px-3 py-2"
                value={form.aday_yas}
                onChange={(e) => setNumber("aday_yas", Number(e.target.value))}
              />
            </Field>
            <Field label="Aday cinsiyeti">
              <select
                value={form.aday_cinsiyet}
                onChange={(e) => setString("aday_cinsiyet", e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
              >
                {adayCinsiyetleri.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </Field>
            <BinaryField
              label="Aday son 6 ay SGK'li calismamis mi?"
              value={form.aday_son_6_ay_issiz}
              onChange={(v) => setBoolean("aday_son_6_ay_issiz", v)}
            />
            <BinaryField
              label="Aday ortalama sigortali sayisina ilave mi?"
              value={form.aday_ortalama_ilave}
              onChange={(v) => setBoolean("aday_ortalama_ilave", v)}
            />
            <BinaryField
              label="Adayin mesleki belge/diploma/ISKUR kurs belgesi var mi?"
              value={form.aday_mesleki_belge}
              onChange={(v) => setBoolean("aday_mesleki_belge", v)}
            />
            <BinaryField
              label="Aday ISKUR'a kayitli issiz mi?"
              value={form.aday_iskur_kayitli}
              onChange={(v) => setBoolean("aday_iskur_kayitli", v)}
            />
            <BinaryField
              label="Aday issizlik odenegi aliyor mu?"
              value={form.aday_issizlik_odenegi}
              onChange={(v) => setBoolean("aday_issizlik_odenegi", v)}
            />
            <BinaryField
              label="Aday eski isyerine donus mu yapiyor?"
              value={form.aday_onceki_isyerine_donus}
              onChange={(v) => setBoolean("aday_onceki_isyerine_donus", v)}
            />
            <BinaryField
              label="Aday engelli statusunde mi?"
              value={form.aday_engelli}
              onChange={(v) => setBoolean("aday_engelli", v)}
            />
            <BinaryField
              label="Aday 2828 kapsaminda mi?"
              value={form.aday_2828}
              onChange={(v) => setBoolean("aday_2828", v)}
            />
            <BinaryField
              label="Aday sosyal yardim kapsaminda mi?"
              value={form.aday_sosyal_yardim}
              onChange={(v) => setBoolean("aday_sosyal_yardim", v)}
            />
          </>
        ) : null}
      </SgkQuestionSection>

      <SgkQuestionSection title="4) 4/B - Bag-Kur Durumu">
        <BinaryField
          label="Musteri 4/B Bag-Kur kapsaminda mi?"
          value={form.bagkur_mukellefi}
          onChange={(v) => setBoolean("bagkur_mukellefi", v)}
        />
        <BinaryField
          label="4/B prim borcu yok mu veya yapilandirilmis mi?"
          value={form.bagkur_borcu_yok}
          onChange={(v) => setBoolean("bagkur_borcu_yok", v)}
        />
      </SgkQuestionSection>

      <AnalysisActionBar
        onStart={runAnalysis}
        onSave={handleSave}
        onReset={resetAnalysis}
        onReportPlaceholder={handleReportPlaceholder}
        isSaving={isSaving}
        saveMessage={saveMessage}
        reportDisabled={false}
      />

      <section ref={resultsSectionRef} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">5) Sonuc ve Oneriler</h2>
        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-emerald-800">Uygun Gorunen Tesvikler</h3>
          {grouped.uygun.length ? (
            grouped.uygun.map((item) => <SgkResultCard key={item.ad} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Uygun tesvik bulunamadi.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-800">Potansiyel / Ek Belgeyle Incelenecek Tesvikler</h3>
          {grouped.potansiyel.length ? (
            grouped.potansiyel.map((item) => <SgkResultCard key={item.ad} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Potansiyel tesvik bulunamadi.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-rose-800">Uygun Gorunmeyen / Riskli Tesvikler</h3>
          {grouped.riskli.length ? (
            grouped.riskli.map((item) => <SgkResultCard key={item.ad} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Riskli tesvik bulunamadi.</p>
          )}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        Bu cikti on degerlendirme niteligindedir. Nihai uygunluk icin SGK Potansiyel Tesvik Sorgulama, e-Bildirge/MUHSGK,
        borc durumu, ise giris tarihi, ortalama sigortali sayisi ve guncel mevzuat ayrica kontrol edilmelidir.
      </footer>
    </div>
  );
}
