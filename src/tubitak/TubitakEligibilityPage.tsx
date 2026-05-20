import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { repairTurkishText } from "../core/text/repairTurkishText";
import { buildInitialWorkspaceState, useAnalysisWorkspace } from "../core/analysis/useAnalysisWorkspace";
import AnalysisActionBar from "../core/components/AnalysisActionBar";
import AnalysisInfoCard from "../core/components/AnalysisInfoCard";
import type { AnalysisInfoState } from "../types/analysis";
import TubitakQuestionSection from "./components/TubitakQuestionSection";
import TubitakResultCard from "./components/TubitakResultCard";
import TubitakSummaryDashboard from "./components/TubitakSummaryDashboard";
import { evaluateTubitakSupports, summarizeTubitakResults } from "./logic/evaluateTubitakSupports";
import { TubitakCompanyType, TubitakFormState, createInitialTubitakFormState } from "./types";

interface FieldProps {
  label: ReactNode;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="block rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
      <span className="mb-2 block font-medium">{typeof label === "string" ? repairTurkishText(label) : label}</span>
      {children}
    </div>
  );
}

function BinaryField({ label, value, onChange }: { label: ReactNode; value: boolean; onChange: (value: boolean) => void }) {
  return (
    <Field label={label}>
      <div className="inline-flex overflow-hidden rounded-lg border border-slate-300 bg-white">
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange(true);
          }}
          className={`px-4 py-2 ${value ? "bg-brand-700 text-white" : "text-slate-700"}`}
        >
          Evet
        </button>
        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onChange(false);
          }}
          className={`px-4 py-2 ${!value ? "bg-brand-700 text-white" : "text-slate-700"}`}
        >
          Hayır
        </button>
      </div>
    </Field>
  );
}

const companyTypes: TubitakCompanyType[] = ["Limited", "Anonim", "Diger"];
const trlLevels = [1, 2, 3, 4, 5, 6, 7, 8, 9];
const tubitakFormStorageKey = "tubitakEligibilityFormState";
const currentTrlInfoText =
  "Projenin bugün itibarıyla teknolojik olgunluk seviyesidir. Fikir/literatür aşaması düşük TRL, prototip ve test aşamaları orta TRL, gerçek ortamda doğrulanmış ve ticarileşmeye hazır ürün yüksek TRL olarak değerlendirilir. TÜBİTAK için mevcut TRL ile hedeflenen TRL arasındaki fark, projenin Ar-Ge gelişim seviyesini anlamaya yardımcı olur.";
const priorityTechnologyInfoText =
  "Öncelikli teknoloji alanları; yapay zekâ, biyoteknoloji, medikal teknolojiler, ileri malzemeler, enerji teknolojileri, batarya, yarı iletkenler, robotik, savunma teknolojileri, makine/üretim teknolojileri ve yeşil dönüşüm gibi stratejik ve yüksek katma değerli alanları ifade eder. Proje bu alanlardan birine giriyorsa TÜBİTAK çağrılarında destek uygunluğu ve önceliklendirme açısından avantaj sağlayabilir.";

const getDefaultTubitakFormState = (): TubitakFormState => createInitialTubitakFormState();

const getStoredTubitakFormState = (): TubitakFormState => {
  const defaultState = getDefaultTubitakFormState();

  if (typeof window === "undefined") return defaultState;

  try {
    const raw = window.localStorage.getItem(tubitakFormStorageKey);
    if (!raw) return defaultState;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return defaultState;

    return { ...defaultState, ...parsed } as TubitakFormState;
  } catch {
    return defaultState;
  }
};

export default function TubitakEligibilityPage() {
  const initialWorkspace = buildInitialWorkspaceState<TubitakFormState>("tubitak", getStoredTubitakFormState);
  const [form, setForm] = useState<TubitakFormState>(() => initialWorkspace.form);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfoState>(initialWorkspace.info);
  const skipNextPersistRef = useRef(false);
  const resultsSectionRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => evaluateTubitakSupports(form), [form]);
  const summary = useMemo(() => summarizeTubitakResults(results, form), [results, form]);

  const groupedResults = useMemo(
    () => ({
      uygun: results.filter((item) => item.status === "UYGUN"),
      potansiyel: results.filter((item) => item.status === "POTANSİYEL"),
      riskli: results.filter((item) => item.status === "UYGUN DEĞİL / RİSKLİ"),
    }),
    [results],
  );

  const updateField = <K extends keyof TubitakFormState>(key: K, value: TubitakFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBoolean = (key: keyof TubitakFormState, value: boolean) =>
    updateField(key, value as TubitakFormState[typeof key]);

  const setNumber = (key: keyof TubitakFormState, value: number) =>
    updateField(key, (Number.isNaN(value) ? 0 : value) as TubitakFormState[typeof key]);

  const setString = (key: keyof TubitakFormState, value: string) => updateField(key, value as TubitakFormState[typeof key]);

  const selectZeroValue = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === "0") {
      requestAnimationFrame(() => {
        event.target.select();
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    if (skipNextPersistRef.current) {
      skipNextPersistRef.current = false;
      return;
    }

    try {
      window.localStorage.setItem(tubitakFormStorageKey, JSON.stringify(form));
    } catch {
      // localStorage yazma başarısız olursa form state memory'de korunur
    }
  }, [form]);

  const handleResetAnalysis = () => {
    if (typeof window !== "undefined") {
      const confirmed = window.confirm("TÜBİTAK analizi için girilen tüm bilgiler sıfırlanacak. Devam etmek istiyor musunuz?");
      if (!confirmed) return;
    }

    skipNextPersistRef.current = true;
    setForm(getDefaultTubitakFormState());

    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(tubitakFormStorageKey);
      } catch {
        // localStorage temizleme başarısız olsa da form default'a döner
      }
    }
  };

  const handleStartAnalysis = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const { setInfoField, clearInfo, isSaving, saveMessage, handleSave, handleReportPlaceholder } = useAnalysisWorkspace({
    analysisType: "tubitak",
    info: analysisInfo,
    setInfo: setAnalysisInfo,
    formData: form as unknown as Record<string, unknown>,
    results: {
      uygun: groupedResults.uygun as unknown as Array<Record<string, unknown>>,
      potansiyel: groupedResults.potansiyel as unknown as Array<Record<string, unknown>>,
      riskli: groupedResults.riskli as unknown as Array<Record<string, unknown>>,
    },
    scores: summary as unknown as Record<string, unknown>,
    defaultTitle: "TÜBİTAK analizi",
  });

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">TÜBİTAK Destek Uygunluk Aracı</h1>
          <p className="mt-1 text-sm text-slate-700">Mali müşavir, bağımsız denetçi ve Ar-Ge danışmanları için ön uygunluk ekranı.</p>
        </div>
      </header>

      <AnalysisInfoCard value={analysisInfo} onChange={setInfoField} />

      <TubitakSummaryDashboard summary={summary} />

      <TubitakQuestionSection title="1. Firma Genel Bilgileri">
        <BinaryField label="Firma Türkiye'de yerleşik mi?" value={form.isTurkeyResident} onChange={(v) => setBoolean("isTurkeyResident", v)} />
        <Field label="Firma sermaye şirketi tipi">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.companyType}
            onChange={(e) => setString("companyType", e.target.value)}
          >
            {companyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </Field>
        <BinaryField label="Firma şahıs şirketi mi?" value={form.isSoleProprietorship} onChange={(v) => setBoolean("isSoleProprietorship", v)} />
        <BinaryField label="Firma KOBİ statüsünde mi?" value={form.isKobi} onChange={(v) => setBoolean("isKobi", v)} />
        <BinaryField label="Firma büyük ölçekli işletme mi?" value={form.isLargeEnterprise} onChange={(v) => setBoolean("isLargeEnterprise", v)} />
        <Field label="Firma kuruluş tarihi">
          <input
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.establishmentDate}
            onChange={(e) => setString("establishmentDate", e.target.value)}
          />
        </Field>
        <BinaryField label="Firma teknokentte mi?" value={form.isInTechnopark} onChange={(v) => setBoolean("isInTechnopark", v)} />
        <BinaryField label="Firma Ar-Ge veya tasarım merkezi mi?" value={form.isArgeOrDesignCenter} onChange={(v) => setBoolean("isArgeOrDesignCenter", v)} />
        <BinaryField label="Firma daha önce TÜBİTAK projesi aldı mı?" value={form.hasPreviousTubitakProject} onChange={(v) => setBoolean("hasPreviousTubitakProject", v)} />
        <BinaryField label="Firma daha önce 1507 aldı mı?" value={form.hasPrevious1507} onChange={(v) => setBoolean("hasPrevious1507", v)} />
        <BinaryField label="Firma daha önce 1501 aldı mı?" value={form.hasPrevious1501} onChange={(v) => setBoolean("hasPrevious1501", v)} />
        <BinaryField label="Firma daha önce 1512/1812 BiGG aldı mı?" value={form.hasPreviousBigg} onChange={(v) => setBoolean("hasPreviousBigg", v)} />
        <BinaryField label="Vergi / SGK borcu var mı?" value={form.hasTaxOrSgkDebt} onChange={(v) => setBoolean("hasTaxOrSgkDebt", v)} />
        <BinaryField label="TÜBİTAK PRODİS kaydı var mı?" value={form.hasProdisRegistration} onChange={(v) => setBoolean("hasProdisRegistration", v)} />
        <BinaryField label="Firma ön kayıt evrakları hazır mı?" value={form.hasPreRegistrationDocs} onChange={(v) => setBoolean("hasPreRegistrationDocs", v)} />
      </TubitakQuestionSection>

      <TubitakQuestionSection title="2. Proje Genel Bilgileri">
        <BinaryField label="Proje yeni ürün geliştirme içeriyor mu?" value={form.hasNewProductDevelopment} onChange={(v) => setBoolean("hasNewProductDevelopment", v)} />
        <BinaryField label="Proje yeni süreç geliştirme içeriyor mu?" value={form.hasNewProcessDevelopment} onChange={(v) => setBoolean("hasNewProcessDevelopment", v)} />
        <BinaryField label="Proje mevcut üründe teknolojik iyileştirme içeriyor mu?" value={form.hasTechImprovement} onChange={(v) => setBoolean("hasTechImprovement", v)} />
        <BinaryField label="Projede teknik belirsizlik veya Ar-Ge riski var mı?" value={form.hasTechnicalUncertainty} onChange={(v) => setBoolean("hasTechnicalUncertainty", v)} />
        <BinaryField label="Proje sadece satın alma/ticari faaliyet/rutin yazılım mı?" value={form.isRoutineCommercialProject} onChange={(v) => setBoolean("isRoutineCommercialProject", v)} />
        <BinaryField label="Projenin özgün yönü var mı?" value={form.hasOriginalValue} onChange={(v) => setBoolean("hasOriginalValue", v)} />
        <BinaryField label="Proje teknik olarak pazarda ayrışıyor mu?" value={form.hasTechnicalDifferentiation} onChange={(v) => setBoolean("hasTechnicalDifferentiation", v)} />
        <BinaryField label="Proje çıktısı ticarileştirilebilir mi?" value={form.hasCommercializationPotential} onChange={(v) => setBoolean("hasCommercializationPotential", v)} />
        <BinaryField label="Projede prototip/MVP/pilot/demo çıktısı var mı?" value={form.hasPrototypeMvpPilotDemo} onChange={(v) => setBoolean("hasPrototypeMvpPilotDemo", v)} />
        <Field label="Hedef TRL seviyesi">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.targetTrl}
            onChange={(e) => setNumber("targetTrl", Number(e.target.value))}
          >
            {trlLevels.map((trl) => (
              <option key={`target-${trl}`} value={trl}>
                {trl}
              </option>
            ))}
          </select>
        </Field>
        <Field
          label={
            <span className="inline-flex items-center gap-2">
              Mevcut TRL seviyesi
              <span className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Mevcut TRL seviyesi açıklaması"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  i
                </button>
                <span className="pointer-events-none absolute left-0 top-7 z-20 hidden w-80 rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-700 shadow-lg group-hover:block group-focus-within:block">
                  {currentTrlInfoText}
                </span>
              </span>
            </span>
          }
        >
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.currentTrl}
            onChange={(e) => setNumber("currentTrl", Number(e.target.value))}
          >
            {trlLevels.map((trl) => (
              <option key={`current-${trl}`} value={trl}>
                {trl}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Proje süresi (ay)">
          <input
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.projectDurationMonths}
            onChange={(e) => setNumber("projectDurationMonths", Number(e.target.value))}
          />
        </Field>
        <Field label="Proje bütçesi (TL)">
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.projectBudget}
            onFocus={selectZeroValue}
            onChange={(e) => setNumber("projectBudget", e.target.value === "" ? 0 : Number(e.target.value))}
          />
        </Field>
        <BinaryField
          label={
            <span className="inline-flex items-center gap-2">
              Proje öncelikli teknoloji alanlarına giriyor mu?
              <span className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Öncelikli teknoloji alanları açıklaması"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  i
                </button>
                <span className="pointer-events-none absolute left-0 top-7 z-20 hidden w-80 rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-700 shadow-lg group-hover:block group-focus-within:block">
                  {priorityTechnologyInfoText}
                </span>
              </span>
            </span>
          }
          value={form.inPriorityTechnologyArea}
          onChange={(v) => setBoolean("inPriorityTechnologyArea", v)}
        />
        <BinaryField label="Proje yeşil dönüşüm/enerji verimliliği/karbon azaltımı içeriyor mu?" value={form.hasGreenTransformationScope} onChange={(v) => setBoolean("hasGreenTransformationScope", v)} />
        <BinaryField label="Proje AI/yazılım/medikal/üretim vb. ileri teknoloji alanı içeriyor mu?" value={form.hasAiOrDeepTechScope} onChange={(v) => setBoolean("hasAiOrDeepTechScope", v)} />
      </TubitakQuestionSection>

      <TubitakQuestionSection title="3. Proje Giderleri">
        <BinaryField label="Personel gideri var mı?" value={form.hasPersonnelExpense} onChange={(v) => setBoolean("hasPersonnelExpense", v)} />
        <BinaryField label="Makine-teçhizat gideri var mı?" value={form.hasMachineryExpense} onChange={(v) => setBoolean("hasMachineryExpense", v)} />
        <BinaryField label="Yazılım/lisans gideri var mı?" value={form.hasSoftwareLicenseExpense} onChange={(v) => setBoolean("hasSoftwareLicenseExpense", v)} />
        <BinaryField label="Malzeme/sarf gideri var mı?" value={form.hasMaterialExpense} onChange={(v) => setBoolean("hasMaterialExpense", v)} />
        <BinaryField label="Test/analiz/doğrulama/validasyon gideri var mı?" value={form.hasTestAnalysisValidationExpense} onChange={(v) => setBoolean("hasTestAnalysisValidationExpense", v)} />
        <BinaryField label="Danışmanlık veya hizmet alımı var mı?" value={form.hasConsultingServiceExpense} onChange={(v) => setBoolean("hasConsultingServiceExpense", v)} />
        <BinaryField label="Seyahat gideri var mı?" value={form.hasTravelExpense} onChange={(v) => setBoolean("hasTravelExpense", v)} />
        <BinaryField label="Üniversite veya araştırma kurumundan hizmet alınacak mı?" value={form.hasUniversityServiceProcurement} onChange={(v) => setBoolean("hasUniversityServiceProcurement", v)} />
        <BinaryField label="Patent/faydalı model/sınai mülkiyet çıktısı bekleniyor mu?" value={form.expectsPatentOutput} onChange={(v) => setBoolean("expectsPatentOutput", v)} />
        <BinaryField label="Proje sonunda ticarileştirme planı var mı?" value={form.hasCommercializationPlan} onChange={(v) => setBoolean("hasCommercializationPlan", v)} />
      </TubitakQuestionSection>

      <TubitakQuestionSection title="4. İş Birliği ve Müşteri Durumu">
        <BinaryField label="Projede üniversite iş birliği var mı?" value={form.hasUniversityCollaboration} onChange={(v) => setBoolean("hasUniversityCollaboration", v)} />
        <BinaryField label="Projede başka bir firma ile ortaklık var mı?" value={form.hasCompanyPartnership} onChange={(v) => setBoolean("hasCompanyPartnership", v)} />
        <BinaryField label="Projede müşteri kuruluş var mı?" value={form.hasCustomerOrganization} onChange={(v) => setBoolean("hasCustomerOrganization", v)} />
        <BinaryField label="Proje müşterinin siparişine/ihtiyacına göre mi?" value={form.isCustomerDrivenProject} onChange={(v) => setBoolean("isCustomerDrivenProject", v)} />
        <BinaryField label="Müşteri kuruluş sonucu satın almak veya kullanmak istiyor mu?" value={form.customerWillBuyOrUseOutput} onChange={(v) => setBoolean("customerWillBuyOrUseOutput", v)} />
        <BinaryField label="Müşteri kuruluş proje bütçesine katkı sağlayacak mı?" value={form.customerWillContributeBudget} onChange={(v) => setBoolean("customerWillContributeBudget", v)} />
        <BinaryField label="Projede kamu/büyük şirket/hastane/sanayi/veri sahibi kurum var mı?" value={form.hasPublicOrLargeDataOwnerInstitution} onChange={(v) => setBoolean("hasPublicOrLargeDataOwnerInstitution", v)} />
        <BinaryField label="Projede AI için veri sağlayacak kurum var mı?" value={form.hasAiDataProviderInstitution} onChange={(v) => setBoolean("hasAiDataProviderInstitution", v)} />
      </TubitakQuestionSection>

      <TubitakQuestionSection title="5. Girişimcilik ve Yatırım Durumu">
        <BinaryField label="Proje erken aşama teknoloji girişimi mi?" value={form.isEarlyStageTechStartup} onChange={(v) => setBoolean("isEarlyStageTechStartup", v)} />
        <BinaryField label="Kurucu ekip henüz şirketleşmedi mi?" value={form.foundersNotIncorporatedYet} onChange={(v) => setBoolean("foundersNotIncorporatedYet", v)} />
        <BinaryField label="Şirket yeni kuruldu mu?" value={form.isNewlyIncorporated} onChange={(v) => setBoolean("isNewlyIncorporated", v)} />
        <BinaryField label="Girişimin teknoloji tabanlı iş fikri var mı?" value={form.hasTechBasedBusinessIdea} onChange={(v) => setBoolean("hasTechBasedBusinessIdea", v)} />
        <BinaryField label="Girişimin mentörlük/hızlandırma/yatırımcı ağı ihtiyacı var mı?" value={form.needsMentoringOrAcceleration} onChange={(v) => setBoolean("needsMentoringOrAcceleration", v)} />
      </TubitakQuestionSection>

      <TubitakQuestionSection title="6. Yeşil Dönüşüm ve Sürdürülebilirlik">
        <BinaryField label="Proje enerji verimliliği sağlıyor mu?" value={form.improvesEnergyEfficiency} onChange={(v) => setBoolean("improvesEnergyEfficiency", v)} />
        <BinaryField label="Proje karbon emisyonunu azaltıyor mu?" value={form.reducesCarbonEmission} onChange={(v) => setBoolean("reducesCarbonEmission", v)} />
        <BinaryField label="Proje su/hammadde/kaynak verimliliği sağlıyor mu?" value={form.improvesResourceEfficiency} onChange={(v) => setBoolean("improvesResourceEfficiency", v)} />
        <BinaryField label="Proje döngüsel ekonomi içeriyor mu?" value={form.includesCircularEconomy} onChange={(v) => setBoolean("includesCircularEconomy", v)} />
        <BinaryField label="Proje AB Yeşil Mutabakatı / CBAM riskine yanıt veriyor mu?" value={form.addressesGreenDealOrCbam} onChange={(v) => setBoolean("addressesGreenDealOrCbam", v)} />
        <BinaryField label="Proje sanayide yeşil dönüşüm yatırımı/teknolojisi içeriyor mu?" value={form.includesIndustrialGreenTransformation} onChange={(v) => setBoolean("includesIndustrialGreenTransformation", v)} />
      </TubitakQuestionSection>

      <TubitakQuestionSection title="7. Uluslararasılaşma">
        <BinaryField label="Projede yurt dışı ortak var mı?" value={form.hasInternationalPartner} onChange={(v) => setBoolean("hasInternationalPartner", v)} />
        <BinaryField label="Proje EUREKA/Eurostars/Ufuk Avrupa benzeri iş birliğine uygun mu?" value={form.fitsInternationalPrograms} onChange={(v) => setBoolean("fitsInternationalPrograms", v)} />
        <BinaryField label="Proje Avrupa veya küresel pazar hedefli mi?" value={form.targetsGlobalMarket} onChange={(v) => setBoolean("targetsGlobalMarket", v)} />
        <BinaryField label="Projede yabancı müşteri/pilot kurum/araştırma ortağı var mı?" value={form.hasForeignCustomerPilotOrResearchPartner} onChange={(v) => setBoolean("hasForeignCustomerPilotOrResearchPartner", v)} />
      </TubitakQuestionSection>

      <AnalysisActionBar
        onStart={handleStartAnalysis}
        onSave={handleSave}
        onReset={() => {
          handleResetAnalysis();
          clearInfo();
        }}
        onReportPlaceholder={handleReportPlaceholder}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />

      <section ref={resultsSectionRef} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">8. Sonuç ve Öneriler</h2>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-emerald-800">Uygun Destekler</h3>
          {groupedResults.uygun.length ? groupedResults.uygun.map((item) => <TubitakResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Uygun destek bulunamadı.</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-800">Potansiyel / Ek Belgeyle İncelenecek Destekler</h3>
          {groupedResults.potansiyel.length ? groupedResults.potansiyel.map((item) => <TubitakResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Potansiyel destek bulunamadı.</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-rose-800">Uygun Görünmeyen / Riskli Destekler</h3>
          {groupedResults.riskli.length ? groupedResults.riskli.map((item) => <TubitakResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Riskli destek bulunamadı.</p>}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <p>
          Bu çıktı ön değerlendirme niteliğindedir. TÜBİTAK desteklerinde nihai uygunluk; güncel çağrı dokümanları,
          uygulama esasları, PRODİS kontrolleri, firma türü, KOBİ statüsü, proje Ar-Ge niteliği, bütçe uygunluğu ve
          TÜBİTAK değerlendirme süreciyle doğrulanmalıdır.
        </p>
        <p className="mt-2 font-medium">
          TÜBİTAK sanayi destek programları ve çağrıları zaman içinde değişebilir. Bu nedenle program kartlarında güncel
          çağrı ve uygulama esasları TÜBİTAK resmi sitesinden kontrol edilmelidir.
        </p>
      </footer>

    </div>
  );
}




