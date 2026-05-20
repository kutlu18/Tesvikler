import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  ProjectSubjectCategory,
  analyzeProjectSubject,
  clearStoredSharedProjectSubject,
  projectSubjectCategoryLabels,
  setStoredSharedProjectSubject,
} from "../core/analysis/projectSubjectAnalysis";
import { useAnalysisWorkspace } from "../core/analysis/useAnalysisWorkspace";
import AnalysisActionBar from "../core/components/AnalysisActionBar";
import { turkeyCities } from "../core/data/turkeyCities";
import turkeyDistricts from "../core/data/turkeyDistricts.json";
import { defaultAnalysisInfoState, type AnalysisInfoState } from "../types/analysis";
import KalkinmaAjansiQuestionSection from "./components/KalkinmaAjansiQuestionSection";
import KalkinmaAjansiResultCard from "./components/KalkinmaAjansiResultCard";
import KalkinmaAjansiSummaryDashboard from "./components/KalkinmaAjansiSummaryDashboard";
import {
  evaluateKalkinmaAjansiSupports,
  summarizeKalkinmaAjansiResults,
} from "./logic/evaluateKalkinmaAjansiSupports";
import {
  ApplicantType,
  KalkinmaFormState,
  NeedSelection,
  NeedType,
  createInitialKalkinmaFormState,
  createInitialNeedSelection,
} from "./types";

interface FieldProps {
  label: string;
  children: ReactNode;
}

type TurkeyDistrictCity = {
  name: string;
  districts: Array<{
    name: string;
  }>;
};

const normalizeLocationKey = (value: string): string =>
  value
    .trim()
    .toLocaleLowerCase("tr-TR")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u");

function Field({ label, children }: FieldProps) {
  return (
    <div className="block rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
      <span className="mb-2 block font-medium">{label}</span>
      {children}
    </div>
  );
}

function BinaryField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}) {
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
          Hayir
        </button>
      </div>
    </Field>
  );
}

const applicantTypes: ApplicantType[] = [
  "KOBI_OZEL_SEKTOR",
  "KOOPERATIF",
  "BELEDIYE_KAMU",
  "UNIVERSITE",
  "STK_DERNEK_VAKIF",
  "ODA_BORSA_BIRLIK",
  "OSB",
  "TGB",
  "YEREL_YONETIM_ISTIRAKI",
  "DIGER",
];

const applicantTypeLabels: Record<ApplicantType, string> = {
  KOBI_OZEL_SEKTOR: "KOBI / ozel sektor isletmesi",
  KOOPERATIF: "Kooperatif",
  BELEDIYE_KAMU: "Belediye / kamu kurumu",
  UNIVERSITE: "Universite",
  STK_DERNEK_VAKIF: "STK / dernek / vakif",
  ODA_BORSA_BIRLIK: "Oda / borsa / birlik",
  OSB: "Organize sanayi bolgesi",
  TGB: "Teknoloji gelistirme bolgesi",
  YEREL_YONETIM_ISTIRAKI: "Yerel yonetim istiraki",
  DIGER: "Diger",
};

const needLabels: Record<NeedType, string> = {
  maliDestek: "Mali Destek",
  teknikDestek: "Teknik Destek",
  fizibilite: "Fizibilite",
  faizsizKredi: "Faizsiz Kredi",
  faizKarPayi: "Faiz / Kar Payi",
  gudumluProje: "Gudumlu Proje",
  sosyalGelisme: "Sosyal Gelisme",
  yerelUrun: "Yerel Urun",
  dijitalDonusum: "Dijital Donusum",
  yesilDonusum: "Yesil Donusum",
};

const emptyNeeds: NeedSelection = {
  maliDestek: false,
  teknikDestek: false,
  fizibilite: false,
  faizsizKredi: false,
  faizKarPayi: false,
  gudumluProje: false,
  sosyalGelisme: false,
  yerelUrun: false,
  dijitalDonusum: false,
  yesilDonusum: false,
};

type ProjectSubjectPreset = {
  id: string;
  label: string;
  subjectText: string;
  categories?: ProjectSubjectCategory[];
  updates: Partial<
    Pick<
      KalkinmaFormState,
      | "isNewInvestment"
      | "isCapacityIncrease"
      | "isDigitalTransformation"
      | "isGreenTransformation"
      | "isSocialImpactProject"
      | "isFeasibilityProject"
      | "isTrainingConsultingNeed"
      | "isTourismCreativeProject"
      | "isLocalProductRuralProject"
      | "hasSoftwareDigitalExpense"
      | "hasEnergyEfficiencyOrGesExpense"
      | "hasFeasibilityReportExpense"
      | "hasConsultingExpense"
      | "hasTrainingExpense"
      | "hasPromotionBrandingExpense"
      | "hasLocalDevelopmentImpact"
      | "linkedToLocalProductTheme"
      | "linkedToSpecialArea"
      | "hasProjectOutputsAndIndicators"
      | "fitsCityPrioritySectors"
    >
  >;
};

const projectSubjectPresets: ProjectSubjectPreset[] = [
  {
    id: "makine-ekipman-yatirimi",
    label: "Makine / ekipman yatirimi",
    subjectText: "Makine ekipman uretim yatirimi ve kapasite artisi",
    categories: ["machineryProductionAutomation"],
    updates: {
      isNewInvestment: true,
      isCapacityIncrease: true,
      hasLocalDevelopmentImpact: true,
      fitsCityPrioritySectors: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
  {
    id: "dijital-donusum",
    label: "Dijital donusum",
    subjectText: "Yazilim, otomasyon, ERP/CRM ve dijital donusum projesi",
    categories: ["softwareSaasPlatform", "ai"],
    updates: {
      isDigitalTransformation: true,
      hasSoftwareDigitalExpense: true,
      hasConsultingExpense: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
  {
    id: "yesil-donusum",
    label: "Yesil donusum / enerji verimliligi",
    subjectText: "Yesil donusum, enerji verimliligi ve karbon azaltim yatirimi",
    categories: ["greenTransformationEnergy"],
    updates: {
      isGreenTransformation: true,
      hasEnergyEfficiencyOrGesExpense: true,
      hasFeasibilityReportExpense: true,
      hasLocalDevelopmentImpact: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
  {
    id: "fizibilite-etut",
    label: "Fizibilite / yatirim etudu",
    subjectText: "Yatirim karari oncesi fizibilite ve etut calismasi",
    updates: {
      isFeasibilityProject: true,
      hasFeasibilityReportExpense: true,
      hasConsultingExpense: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
  {
    id: "egitim-danismanlik",
    label: "Egitim / danismanlik / teknik kapasite",
    subjectText: "Kurumsal kapasite artisi icin egitim ve danismanlik ihtiyaci",
    updates: {
      isTrainingConsultingNeed: true,
      hasTrainingExpense: true,
      hasConsultingExpense: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
  {
    id: "turizm-kultur-yaratici",
    label: "Turizm / kultur / yaratici endustri",
    subjectText: "Turizm, kultur ve yaratici endustri odakli yerel kalkinma projesi",
    updates: {
      isTourismCreativeProject: true,
      hasPromotionBrandingExpense: true,
      hasLocalDevelopmentImpact: true,
      fitsCityPrioritySectors: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
  {
    id: "yerel-urun-kooperatif",
    label: "Yerel urun / kooperatif / kirsal kalkinma",
    subjectText: "Yerel urun ticarilestirme ve kooperatif/kirsal kalkinma projesi",
    categories: ["agriFoodLivestock"],
    updates: {
      isLocalProductRuralProject: true,
      linkedToLocalProductTheme: true,
      hasLocalDevelopmentImpact: true,
      fitsCityPrioritySectors: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
  {
    id: "sosyal-girisim-istihdam",
    label: "Sosyal girisimcilik / istihdam / kadin-genc",
    subjectText: "Sosyal etki, istihdam ve kadin-genc odakli kalkinma projesi",
    updates: {
      isSocialImpactProject: true,
      hasLocalDevelopmentImpact: true,
      linkedToSpecialArea: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
  {
    id: "afet-dayaniklilik",
    label: "Afet dayanikliligi / deprem bolgesi toparlanma",
    subjectText: "Afet dayanikliligi ve deprem bolgesi ekonomik toparlanma projesi",
    updates: {
      isNewInvestment: true,
      linkedToSpecialArea: true,
      hasLocalDevelopmentImpact: true,
      hasProjectOutputsAndIndicators: true,
    },
  },
];

export default function KalkinmaAjansiEligibilityPage() {
  const [selection, setSelection] = useState<NeedSelection>(createInitialNeedSelection);
  const [form, setForm] = useState<KalkinmaFormState>(createInitialKalkinmaFormState);
  const [selectedProjectSubjectPresetIds, setSelectedProjectSubjectPresetIds] = useState<string[]>([]);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfoState>(defaultAnalysisInfoState);
  const resultsSectionRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => evaluateKalkinmaAjansiSupports(form, selection), [form, selection]);
  const summary = useMemo(() => summarizeKalkinmaAjansiResults(results, form), [results, form]);

  const groupedResults = useMemo(
    () => ({
      uygun: results.filter((item) => item.status === "UYGUN"),
      potansiyel: results.filter((item) => item.status === "POTANSIYEL"),
      riskli: results.filter((item) => item.status === "UYGUN DEGIL / RISKLI"),
    }),
    [results],
  );
  const projectSubjectAnalysis = useMemo(() => analyzeProjectSubject(form.projectSubject), [form.projectSubject]);

  const projectDistrictOptions = useMemo(() => {
    const districtsByCity = (turkeyDistricts as TurkeyDistrictCity[]).reduce<Record<string, string[]>>((accumulator, cityItem) => {
      accumulator[normalizeLocationKey(cityItem.name)] = cityItem.districts
        .map((district) => district.name.trim())
        .filter(Boolean)
        .sort((left, right) => left.localeCompare(right, "tr"));

      return accumulator;
    }, {});

    const cityKey = normalizeLocationKey(form.projectCity);
    return districtsByCity[cityKey] ?? [];
  }, [form.projectCity]);

  const updateField = <K extends keyof KalkinmaFormState>(key: K, value: KalkinmaFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBoolean = (key: keyof KalkinmaFormState, value: boolean) =>
    updateField(key, value as KalkinmaFormState[typeof key]);
  const setString = (key: keyof KalkinmaFormState, value: string) =>
    updateField(key, value as KalkinmaFormState[typeof key]);
  const setNumber = (key: keyof KalkinmaFormState, value: number) =>
    updateField(key, (Number.isNaN(value) ? 0 : value) as KalkinmaFormState[typeof key]);

  const selectZeroValue = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === "0") {
      requestAnimationFrame(() => {
        event.target.select();
      });
    }
  };

  const toggleNeed = (need: NeedType) => {
    setSelection((prev) => ({ ...prev, [need]: !prev[need] }));
  };

  const setAllNeeds = () => setSelection(createInitialNeedSelection());
  const clearAllNeeds = () => setSelection(emptyNeeds);

  const allNeedsSelected = Object.values(selection).every(Boolean);
  const noNeedSelected = Object.values(selection).every((item) => !item);

  const showMaliSupportSection = selection.maliDestek;
  const showTeknikSupportSection = selection.teknikDestek;
  const showFizibiliteSection = selection.fizibilite;
  const showFinanceSection = selection.faizsizKredi || selection.faizKarPayi;
  const showGuidedSection = selection.gudumluProje;
  const showDigitalFlow = selection.dijitalDonusum;
  const showGreenFlow = selection.yesilDonusum;
  const showSocialFlow = selection.sosyalGelisme;
  const showLocalFlow = selection.yerelUrun;
  const showInvestmentFlow =
    selection.maliDestek || selection.faizsizKredi || selection.faizKarPayi || selection.gudumluProje;
  const showTourismFlow = selection.maliDestek || selection.yerelUrun || selection.sosyalGelisme;
  const showCommonProjectFlow = !noNeedSelected;

  const { clearInfo, isSaving, saveMessage, handleSave, handleReportPlaceholder } = useAnalysisWorkspace({
    analysisType: "kalkinma_ajansi",
    info: analysisInfo,
    setInfo: setAnalysisInfo,
    formData: {
      ...form,
      selectedNeeds: selection,
    } as Record<string, unknown>,
    results: {
      uygun: groupedResults.uygun as unknown as Array<Record<string, unknown>>,
      potansiyel: groupedResults.potansiyel as unknown as Array<Record<string, unknown>>,
      riskli: groupedResults.riskli as unknown as Array<Record<string, unknown>>,
    },
    scores: summary as unknown as Record<string, unknown>,
    extractedCategories: {
      categories: projectSubjectAnalysis.categories,
      keywords: projectSubjectAnalysis.matchedKeywords,
    },
    defaultTitle: "Kalkınma Ajansı analizi",
  });

  useEffect(() => {
    if (!form.projectDistrict) {
      return;
    }

    if (!projectDistrictOptions.includes(form.projectDistrict)) {
      setForm((prev) => ({ ...prev, projectDistrict: "" }));
    }
  }, [form.projectDistrict, projectDistrictOptions]);

  const resetAnalysis = () => {
    setSelection(createInitialNeedSelection());
    setSelectedProjectSubjectPresetIds([]);
    setForm(createInitialKalkinmaFormState());
    clearStoredSharedProjectSubject();
    clearInfo();
  };

  const toggleProjectSubjectPreset = (preset: ProjectSubjectPreset) => {
    setSelectedProjectSubjectPresetIds((previousPresetIds) => {
      const isActive = previousPresetIds.includes(preset.id);
      const nextPresetIds = isActive
        ? previousPresetIds.filter((item) => item !== preset.id)
        : [...previousPresetIds, preset.id];

      setForm((previousForm) => {
        const nextForm: KalkinmaFormState = { ...previousForm };
        const activePresets = projectSubjectPresets.filter((item) => nextPresetIds.includes(item.id));

        const managedFields = Array.from(
          new Set(projectSubjectPresets.flatMap((item) => Object.keys(item.updates))),
        ) as Array<keyof KalkinmaFormState>;

        for (const field of managedFields) {
          (nextForm as unknown as Record<string, unknown>)[field as string] = false;
        }

        for (const activePreset of activePresets) {
          for (const [field, value] of Object.entries(activePreset.updates)) {
            if (value) {
              (nextForm as unknown as Record<string, unknown>)[field] = true;
            }
          }
        }

        const combinedSubject = activePresets.map((item) => item.subjectText).join(" | ");
        nextForm.projectSubject = combinedSubject;
        setStoredSharedProjectSubject(combinedSubject);

        return nextForm;
      });

      return nextPresetIds;
    });
  };

  const handleStartAnalysis = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Kalkinma Ajanslari Destek Uygunluk Araci</h1>
        <p className="mt-1 text-sm text-slate-700">
          Mali musavirlik, bagimsiz denetim ve tesvik danismanligi ekipleri icin Kalkinma Ajanslari desteklerinde on
          uygunluk degerlendirme ekrani.
        </p>
      </header>

      <KalkinmaAjansiSummaryDashboard summary={summary} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Proje / destek ihtiyaci tipi secimi</h2>
        <p className="mt-1 text-sm text-slate-600">Birden fazla secim yapabilirsiniz. Secime gore soru gruplari aktiflesir.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={setAllNeeds}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              allNeedsSelected ? "bg-brand-700 text-white" : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Tumu
          </button>
          <button
            type="button"
            onClick={clearAllNeeds}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${
              noNeedSelected ? "bg-brand-700 text-white" : "border border-slate-300 bg-white text-slate-700"
            }`}
          >
            Temizle
          </button>
          {(Object.keys(needLabels) as NeedType[]).map((needKey) => (
            <button
              key={needKey}
              type="button"
              onClick={() => toggleNeed(needKey)}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                selection[needKey] ? "bg-brand-700 text-white" : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {needLabels[needKey]}
            </button>
          ))}
        </div>
      </section>

      <KalkinmaAjansiQuestionSection title="1. Basvuru Sahibi Bilgileri">
        <Field label="Basvuru sahibi kimdir?">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.applicantType}
            onChange={(event) => updateField("applicantType", event.target.value as ApplicantType)}
          >
            {applicantTypes.map((type) => (
              <option key={type} value={type}>
                {applicantTypeLabels[type]}
              </option>
            ))}
          </select>
        </Field>
        <BinaryField
          label="Basvuru sahibi Turkiye'de yerlesik mi?"
          value={form.isTurkeyResident}
          onChange={(v) => setBoolean("isTurkeyResident", v)}
        />
        <Field label="Basvuru sahibi hangi ilde?">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.applicantCity}
            onChange={(event) => setString("applicantCity", event.target.value)}
          >
            <option value="">Il secin</option>
            {turkeyCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
        <BinaryField
          label="Faaliyet ili hangi kalkinma ajansinin bolgesinde oldugu net mi?"
          value={form.agencyRegionKnown}
          onChange={(v) => setBoolean("agencyRegionKnown", v)}
        />
        <BinaryField label="Firma KOBI mi?" value={form.isKobi} onChange={(v) => setBoolean("isKobi", v)} />
        <BinaryField
          label="Firma imalatci mi?"
          value={form.isManufacturer}
          onChange={(v) => setBoolean("isManufacturer", v)}
        />
        <BinaryField
          label="Firma hizmet sektorunde mi?"
          value={form.isServiceSector}
          onChange={(v) => setBoolean("isServiceSector", v)}
        />
        <BinaryField
          label="Firma ihracat yapiyor mu?"
          value={form.exports}
          onChange={(v) => setBoolean("exports", v)}
        />
        <BinaryField
          label="Daha once kalkinma ajansi destegi aldi mi?"
          value={form.receivedAgencySupportBefore}
          onChange={(v) => setBoolean("receivedAgencySupportBefore", v)}
        />
        <BinaryField
          label="Daha once proje iptali/usulsuzluk/sozlesme feshi yasandi mi?"
          value={form.hadProjectCancellationOrIrregularity}
          onChange={(v) => setBoolean("hadProjectCancellationOrIrregularity", v)}
        />
        <BinaryField
          label="Vergi/SGK borcu var mi?"
          value={form.hasTaxOrSgkDebt}
          onChange={(v) => setBoolean("hasTaxOrSgkDebt", v)}
        />
        <BinaryField
          label="Es finansman saglayabilecek mi?"
          value={form.canProvideCoFinance}
          onChange={(v) => setBoolean("canProvideCoFinance", v)}
        />
        <BinaryField
          label="Proje yurutme ve raporlama kapasitesi var mi?"
          value={form.hasProjectManagementCapacity}
          onChange={(v) => setBoolean("hasProjectManagementCapacity", v)}
        />
      </KalkinmaAjansiQuestionSection>

      <KalkinmaAjansiQuestionSection title="2. Bolge ve Il Uygunlugu">
        <Field label="Proje hangi ilde uygulanacak?">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.projectCity}
            onChange={(event) => setString("projectCity", event.target.value)}
          >
            <option value="">Il secin</option>
            {turkeyCities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Proje hangi ilcede uygulanacak?">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.projectDistrict}
            onChange={(event) => setString("projectDistrict", event.target.value)}
            disabled={!form.projectCity || projectDistrictOptions.length === 0}
          >
            <option value="">{!form.projectCity ? "Once il secin" : "Ilce secin"}</option>
            {projectDistrictOptions.map((district) => (
              <option key={district} value={district}>
                {district}
              </option>
            ))}
          </select>
        </Field>
        <BinaryField
          label="Proje birden fazla il/ilce iceriyor mu?"
          value={form.hasMultiCityScope}
          onChange={(v) => setBoolean("hasMultiCityScope", v)}
        />
        <BinaryField
          label="Proje ilgili kalkinma ajansi bolgesinde mi?"
          value={form.projectInAgencyRegion}
          onChange={(v) => setBoolean("projectInAgencyRegion", v)}
        />
        <BinaryField
          label="Proje bolge plani onceliklerine uyuyor mu?"
          value={form.fitsRegionalPlanPriorities}
          onChange={(v) => setBoolean("fitsRegionalPlanPriorities", v)}
        />
        <BinaryField
          label="Proje ilin oncelikli sektorleriyle uyumlu mu?"
          value={form.fitsCityPrioritySectors}
          onChange={(v) => setBoolean("fitsCityPrioritySectors", v)}
        />
        <BinaryField
          label="Proje yerel kalkinma, istihdam, rekabetcilik veya surdurulebilirlik etkisi yaratiyor mu?"
          value={form.hasLocalDevelopmentImpact}
          onChange={(v) => setBoolean("hasLocalDevelopmentImpact", v)}
        />
        {showSocialFlow || showLocalFlow || showGuidedSection || showGreenFlow ? (
          <BinaryField
            label="Proje deprem bolgesi/kirsal alan/OSB/turizm destinasyonu/dezavantajli bolge ile iliskili mi?"
            value={form.linkedToSpecialArea}
            onChange={(v) => setBoolean("linkedToSpecialArea", v)}
          />
        ) : null}
        {showLocalFlow || showSocialFlow ? (
          <BinaryField
            label="Proje yerel urunlerin ticarilestirilmesi veya Anadoludakiler temasiyla iliskili mi?"
            value={form.linkedToLocalProductTheme}
            onChange={(v) => setBoolean("linkedToLocalProductTheme", v)}
          />
        ) : null}
      </KalkinmaAjansiQuestionSection>

      <KalkinmaAjansiQuestionSection title="3. Proje Genel Bilgileri">
        <Field label="Proje konusu nedir?">
          <div className="space-y-3">
            <div className="grid gap-2 sm:grid-cols-2">
              {projectSubjectPresets.map((preset) => {
                const active = selectedProjectSubjectPresetIds.includes(preset.id);

                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => toggleProjectSubjectPreset(preset)}
                    className={`rounded-lg border px-3 py-2 text-left text-sm font-medium transition ${
                      active
                        ? "border-brand-700 bg-brand-700 text-white"
                        : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {preset.label}
                  </button>
                );
              })}
            </div>
            <p className="text-xs leading-5 text-slate-500">
              Bu listede secilen proje konulari, sonuclari etkileyen alanlari otomatik isaretler ve degerlendirme
              algoritmasina dogrudan yansir.
            </p>
            {projectSubjectAnalysis.categories.length ? (
              <div className="flex flex-wrap gap-2">
                {projectSubjectAnalysis.categories.map((category) => (
                  <span
                    key={category}
                    className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-700"
                  >
                    {projectSubjectCategoryLabels[category]}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-amber-700">
                Daha net etki icin proje konusu icinde teknoloji, sektor, musteri tipi veya yatirim amacini daha acik yazin.
              </p>
            )}
          </div>
        </Field>
        {showInvestmentFlow ? (
          <BinaryField
            label="Proje yeni yatirim mi?"
            value={form.isNewInvestment}
            onChange={(v) => setBoolean("isNewInvestment", v)}
          />
        ) : null}
        {showInvestmentFlow || showDigitalFlow || showGreenFlow ? (
          <BinaryField
            label="Proje kapasite artirimi mi?"
            value={form.isCapacityIncrease}
            onChange={(v) => setBoolean("isCapacityIncrease", v)}
          />
        ) : null}
        {showDigitalFlow ? (
          <BinaryField
            label="Proje dijital donusum mu?"
            value={form.isDigitalTransformation}
            onChange={(v) => setBoolean("isDigitalTransformation", v)}
          />
        ) : null}
        {showGreenFlow ? (
          <BinaryField
            label="Proje yesil donusum mu?"
            value={form.isGreenTransformation}
            onChange={(v) => setBoolean("isGreenTransformation", v)}
          />
        ) : null}
        {showSocialFlow || showGuidedSection ? (
          <BinaryField
            label="Proje sosyal etki / istihdam projesi mi?"
            value={form.isSocialImpactProject}
            onChange={(v) => setBoolean("isSocialImpactProject", v)}
          />
        ) : null}
        {showFizibiliteSection ? (
          <BinaryField
            label="Proje fizibilite calismasi mi?"
            value={form.isFeasibilityProject}
            onChange={(v) => setBoolean("isFeasibilityProject", v)}
          />
        ) : null}
        {showTeknikSupportSection ? (
          <BinaryField
            label="Proje egitim/danismanlik/teknik destek ihtiyaci mi?"
            value={form.isTrainingConsultingNeed}
            onChange={(v) => setBoolean("isTrainingConsultingNeed", v)}
          />
        ) : null}
        {showTourismFlow ? (
          <BinaryField
            label="Proje turizm/kultur/yaratici endustri projesi mi?"
            value={form.isTourismCreativeProject}
            onChange={(v) => setBoolean("isTourismCreativeProject", v)}
          />
        ) : null}
        {showLocalFlow ? (
          <BinaryField
            label="Proje yerel urun/kooperatif/kirsal kalkinma projesi mi?"
            value={form.isLocalProductRuralProject}
            onChange={(v) => setBoolean("isLocalProductRuralProject", v)}
          />
        ) : null}
        <Field label="Proje butcesi yaklasik ne kadar?">
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.projectBudget}
            onFocus={selectZeroValue}
            onChange={(event) => setNumber("projectBudget", Number(event.target.value))}
          />
        </Field>
        <Field label="Proje suresi kac ay?">
          <input
            type="number"
            min={1}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.projectDurationMonths}
            onChange={(event) => setNumber("projectDurationMonths", Number(event.target.value))}
          />
        </Field>
        {showCommonProjectFlow ? (
          <BinaryField
            label="Proje hazirlik dosyasi var mi?"
            value={form.hasProjectDraftFile}
            onChange={(v) => setBoolean("hasProjectDraftFile", v)}
          />
        ) : null}
        <BinaryField
          label="Proje ciktilari ve performans gostergeleri tanimli mi?"
          value={form.hasProjectOutputsAndIndicators}
          onChange={(v) => setBoolean("hasProjectOutputsAndIndicators", v)}
        />
        {showGuidedSection || showSocialFlow || showLocalFlow ? (
          <BinaryField
            label="Projede ortak veya istirakci var mi?"
            value={form.hasPartnersOrAffiliates}
            onChange={(v) => setBoolean("hasPartnersOrAffiliates", v)}
          />
        ) : null}
        {showInvestmentFlow || showLocalFlow || showGuidedSection ? (
          <BinaryField
            label="Projede surdurulebilir gelir modeli var mi?"
            value={form.hasSustainableRevenueModel}
            onChange={(v) => setBoolean("hasSustainableRevenueModel", v)}
          />
        ) : null}
        <BinaryField
          label="Proje baska kamu destegiyle finanse ediliyor mu?"
          value={form.financedByOtherPublicSupport}
          onChange={(v) => setBoolean("financedByOtherPublicSupport", v)}
        />
      </KalkinmaAjansiQuestionSection>

      <KalkinmaAjansiQuestionSection title="4. Harcama ve Gider Bilgileri">
        {showInvestmentFlow || showLocalFlow || showGreenFlow ? (
          <BinaryField
            label="Makine/ekipman alimi var mi?"
            value={form.hasMachineryEquipmentExpense}
            onChange={(v) => setBoolean("hasMachineryEquipmentExpense", v)}
          />
        ) : null}
        {showDigitalFlow || showTeknikSupportSection || showMaliSupportSection ? (
          <BinaryField
            label="Yazilim/dijital altyapi gideri var mi?"
            value={form.hasSoftwareDigitalExpense}
            onChange={(v) => setBoolean("hasSoftwareDigitalExpense", v)}
          />
        ) : null}
        {showTeknikSupportSection || showFizibiliteSection || showMaliSupportSection ? (
          <BinaryField
            label="Danismanlik gideri var mi?"
            value={form.hasConsultingExpense}
            onChange={(v) => setBoolean("hasConsultingExpense", v)}
          />
        ) : null}
        {showTeknikSupportSection || showSocialFlow ? (
          <BinaryField
            label="Egitim gideri var mi?"
            value={form.hasTrainingExpense}
            onChange={(v) => setBoolean("hasTrainingExpense", v)}
          />
        ) : null}
        {showFizibiliteSection || showGreenFlow || showMaliSupportSection ? (
          <BinaryField
            label="Fizibilite/rapor/etut gideri var mi?"
            value={form.hasFeasibilityReportExpense}
            onChange={(v) => setBoolean("hasFeasibilityReportExpense", v)}
          />
        ) : null}
        {showInvestmentFlow || showGuidedSection || showLocalFlow ? (
          <BinaryField
            label="Insaat/tadilat gideri var mi?"
            value={form.hasConstructionRenovationExpense}
            onChange={(v) => setBoolean("hasConstructionRenovationExpense", v)}
          />
        ) : null}
        {showLocalFlow || showSocialFlow || showTourismFlow ? (
          <BinaryField
            label="Tanitim/markalasma gideri var mi?"
            value={form.hasPromotionBrandingExpense}
            onChange={(v) => setBoolean("hasPromotionBrandingExpense", v)}
          />
        ) : null}
        {showSocialFlow || showGuidedSection || showMaliSupportSection ? (
          <BinaryField
            label="Personel gideri var mi?"
            value={form.hasPersonnelExpense}
            onChange={(v) => setBoolean("hasPersonnelExpense", v)}
          />
        ) : null}
        {showTeknikSupportSection || showSocialFlow || showGuidedSection ? (
          <BinaryField
            label="Seyahat/organizasyon gideri var mi?"
            value={form.hasTravelOrganizationExpense}
            onChange={(v) => setBoolean("hasTravelOrganizationExpense", v)}
          />
        ) : null}
        {showGreenFlow ? (
          <BinaryField
            label="Enerji verimliligi veya GES yatirimi var mi?"
            value={form.hasEnergyEfficiencyOrGesExpense}
            onChange={(v) => setBoolean("hasEnergyEfficiencyOrGesExpense", v)}
          />
        ) : null}
        <BinaryField
          label="Harcamalar proje onayindan once yapildi mi?"
          value={form.expensesBeforeApproval}
          onChange={(v) => setBoolean("expensesBeforeApproval", v)}
        />
        <BinaryField
          label="Harcamalar icin proforma faturalar hazir mi?"
          value={form.hasProformaInvoices}
          onChange={(v) => setBoolean("hasProformaInvoices", v)}
        />
        <BinaryField
          label="Teknik sartnameler hazir mi?"
          value={form.hasTechnicalSpecifications}
          onChange={(v) => setBoolean("hasTechnicalSpecifications", v)}
        />
        <BinaryField
          label="Es finansman icin butce ayrildi mi?"
          value={form.coFinanceBudgetAllocated}
          onChange={(v) => setBoolean("coFinanceBudgetAllocated", v)}
        />
      </KalkinmaAjansiQuestionSection>

      {showMaliSupportSection ? (
        <KalkinmaAjansiQuestionSection title="5. Mali Destek Programi Uygunlugu">
          <BinaryField
            label="Ilgili ajansin acik mali destek programi var mi?"
            value={form.hasOpenFinancialCall}
            onChange={(v) => setBoolean("hasOpenFinancialCall", v)}
          />
          <BinaryField
            label="Program ozel sektor isletmelerine acik mi?"
            value={form.callOpenToPrivateSector}
            onChange={(v) => setBoolean("callOpenToPrivateSector", v)}
          />
          <BinaryField
            label="Program kooperatif/STK/kamu/universite basvurusuna acik mi?"
            value={form.callOpenToNonProfitPublic}
            onChange={(v) => setBoolean("callOpenToNonProfitPublic", v)}
          />
          <BinaryField
            label="Proje program oncelikleriyle uyumlu mu?"
            value={form.fitsProgramPriorities}
            onChange={(v) => setBoolean("fitsProgramPriorities", v)}
          />
          <BinaryField
            label="Proje butcesi program alt/ust limitleriyle uyumlu mu?"
            value={form.budgetWithinCallLimits}
            onChange={(v) => setBoolean("budgetWithinCallLimits", v)}
          />
          <BinaryField
            label="Es finansman orani karsilanabiliyor mu?"
            value={form.coFinanceRateMet}
            onChange={(v) => setBoolean("coFinanceRateMet", v)}
          />
          <BinaryField
            label="Proje KAYS basvurusuna hazir mi?"
            value={form.readyForKaysSubmission}
            onChange={(v) => setBoolean("readyForKaysSubmission", v)}
          />
          <BinaryField
            label="Satin alma, gorunurluk, raporlama ve izleme yukumlulukleri karsilanabilir mi?"
            value={form.canMeetProcurementVisibilityReporting}
            onChange={(v) => setBoolean("canMeetProcurementVisibilityReporting", v)}
          />
        </KalkinmaAjansiQuestionSection>
      ) : null}

      {showTeknikSupportSection ? (
        <KalkinmaAjansiQuestionSection title="6. Teknik Destek Uygunlugu">
          <BinaryField
            label="Ihtiyac egitim/danismanlik/kapasite gelistirme veya uzman destegi mi?"
            value={form.technicalNeedIsCapacityBuilding}
            onChange={(v) => setBoolean("technicalNeedIsCapacityBuilding", v)}
          />
          <BinaryField
            label="Basvuru sahibi teknik destek kapsaminda uygun mu?"
            value={form.applicantEligibleForTechnicalSupport}
            onChange={(v) => setBoolean("applicantEligibleForTechnicalSupport", v)}
          />
          <BinaryField
            label="Talep edilen destek nakit/makine degil, teknik uzmanlik mi?"
            value={form.technicalSupportNotCashMachinery}
            onChange={(v) => setBoolean("technicalSupportNotCashMachinery", v)}
          />
          <BinaryField
            label="Ihtiyac alani (dijital, kalite, strateji, fizibilite vb.) uygun mu?"
            value={form.technicalNeedAreaRelevant}
            onChange={(v) => setBoolean("technicalNeedAreaRelevant", v)}
          />
          <BinaryField
            label="Teknik destek ciktisi somut tanimlandi mi?"
            value={form.technicalOutputDefined}
            onChange={(v) => setBoolean("technicalOutputDefined", v)}
          />
          <BinaryField
            label="Egitim/danismanlik alacak ekip belli mi?"
            value={form.technicalTeamDefined}
            onChange={(v) => setBoolean("technicalTeamDefined", v)}
          />
        </KalkinmaAjansiQuestionSection>
      ) : null}

      {showFizibiliteSection ? (
        <KalkinmaAjansiQuestionSection title="7. Fizibilite Destegi Uygunlugu">
          <BinaryField
            label="Proje yatirim karari oncesi fizibilite/etut calismasi mi?"
            value={form.feasibilityBeforeInvestmentDecision}
            onChange={(v) => setBoolean("feasibilityBeforeInvestmentDecision", v)}
          />
          <BinaryField
            label="Yatirimin bolge kalkinmasina katkisi var mi?"
            value={form.feasibilityHasRegionalImpact}
            onChange={(v) => setBoolean("feasibilityHasRegionalImpact", v)}
          />
          <BinaryField
            label="Proje bolge ekonomisi acisindan firsat/risk alanina bagli mi?"
            value={form.feasibilityRelatedToRegionalOpportunity}
            onChange={(v) => setBoolean("feasibilityRelatedToRegionalOpportunity", v)}
          />
          <BinaryField
            label="Proje temasi (yenilik, yerel urun, turizm, enerji vb.) uygun mu?"
            value={form.feasibilityThemeRelevant}
            onChange={(v) => setBoolean("feasibilityThemeRelevant", v)}
          />
          <BinaryField
            label="Fizibilite raporu sonunda yatirim karari alinabilir mi?"
            value={form.feasibilityCanLeadToInvestmentDecision}
            onChange={(v) => setBoolean("feasibilityCanLeadToInvestmentDecision", v)}
          />
          <BinaryField
            label="Basvuru sahibi uygun kurum/kurulus mu?"
            value={form.feasibilityApplicantEligible}
            onChange={(v) => setBoolean("feasibilityApplicantEligible", v)}
          />
          <BinaryField
            label="Es finansman saglanabiliyor mu?"
            value={form.feasibilityCoFinancePossible}
            onChange={(v) => setBoolean("feasibilityCoFinancePossible", v)}
          />
          <BinaryField
            label="Fizibilite calismasi icin hizmet alimi planlaniyor mu?"
            value={form.feasibilityServiceProcurementPlanned}
            onChange={(v) => setBoolean("feasibilityServiceProcurementPlanned", v)}
          />
          <BinaryField
            label="Rapor bir yil icinde tamamlanabilir mi?"
            value={form.feasibilityCompletesWithinOneYear}
            onChange={(v) => setBoolean("feasibilityCompletesWithinOneYear", v)}
          />
        </KalkinmaAjansiQuestionSection>
      ) : null}

      {showFinanceSection ? (
        <KalkinmaAjansiQuestionSection title="8. Faizsiz Kredi / Finansman Destegi Uygunlugu">
          <BinaryField
            label="Proje ozel sektor yatirim projesi mi?"
            value={form.financeProjectIsPrivateInvestment}
            onChange={(v) => setBoolean("financeProjectIsPrivateInvestment", v)}
          />
          <BinaryField
            label="Isletmenin kredi ihtiyaci var mi?"
            value={form.financeNeedExists}
            onChange={(v) => setBoolean("financeNeedExists", v)}
          />
          <BinaryField
            label="Proje ajansin oncelikli sektor ve konularina giriyor mu?"
            value={form.financeFitsAgencyPriorities}
            onChange={(v) => setBoolean("financeFitsAgencyPriorities", v)}
          />
          <BinaryField
            label="Araci finans kurumu uzerinden kredi kullanilabilir mi?"
            value={form.financeViaIntermediaryPossible}
            onChange={(v) => setBoolean("financeViaIntermediaryPossible", v)}
          />
          <BinaryField
            label="Geri odeme kapasitesi var mi?"
            value={form.financeRepaymentCapacity}
            onChange={(v) => setBoolean("financeRepaymentCapacity", v)}
          />
          <BinaryField
            label="Teminat yapisi uygun mu?"
            value={form.financeCollateralSuitable}
            onChange={(v) => setBoolean("financeCollateralSuitable", v)}
          />
          <BinaryField
            label="Proje yatirim/isletme sermayesi niteliginde mi?"
            value={form.financeTypeInvestmentOrWorkingCapital}
            onChange={(v) => setBoolean("financeTypeInvestmentOrWorkingCapital", v)}
          />
          <BinaryField
            label="Kredi vadesi ve geri odeme plani olusturulabilir mi?"
            value={form.financeMaturityAndRepaymentPlanReady}
            onChange={(v) => setBoolean("financeMaturityAndRepaymentPlanReady", v)}
          />
        </KalkinmaAjansiQuestionSection>
      ) : null}

      {showGuidedSection ? (
        <KalkinmaAjansiQuestionSection title="9. Gudumlu Proje / Buyuk Olcekli Yerel Kalkinma Projesi">
          <BinaryField
            label="Proje kamu, universite, oda, OSB, belediye veya stratejik kurumlarla birlikte mi?"
            value={form.guidedProjectWithStrategicActors}
            onChange={(v) => setBoolean("guidedProjectWithStrategicActors", v)}
          />
          <BinaryField
            label="Proje bolge icin stratejik ve yuksek etki potansiyeline sahip mi?"
            value={form.guidedProjectHighRegionalImpact}
            onChange={(v) => setBoolean("guidedProjectHighRegionalImpact", v)}
          />
          <BinaryField
            label="Proje istihdam/kumelenme/teknoloji/turizm/sosyal kalkinma etkisi yaratiyor mu?"
            value={form.guidedProjectCreatesEcosystemImpact}
            onChange={(v) => setBoolean("guidedProjectCreatesEcosystemImpact", v)}
          />
          <BinaryField
            label="Proje bireysel firma yatirimindan daha genis ekosistem etkisi tasiyor mu?"
            value={form.guidedProjectBeyondSingleCompany}
            onChange={(v) => setBoolean("guidedProjectBeyondSingleCompany", v)}
          />
          <BinaryField
            label="Proje ortaklik yapisi ve yonetisim modeli hazir mi?"
            value={form.guidedProjectGovernanceReady}
            onChange={(v) => setBoolean("guidedProjectGovernanceReady", v)}
          />
          <BinaryField
            label="Proje icin ajansla on gorusme gerekiyor mu?"
            value={form.guidedProjectNeedsAgencyPreConsultation}
            onChange={(v) => setBoolean("guidedProjectNeedsAgencyPreConsultation", v)}
          />
        </KalkinmaAjansiQuestionSection>
      ) : null}

      <KalkinmaAjansiQuestionSection title="10. Belge ve Basvuru Hazirligi">
        <BinaryField
          label="KAYS kullanici kaydi var mi?"
          value={form.hasKaysUserAccount}
          onChange={(v) => setBoolean("hasKaysUserAccount", v)}
        />
        <BinaryField
          label="Yetkili kisi KAYS uzerinden basvuru yapabiliyor mu?"
          value={form.kaysAuthorizedSignatoryReady}
          onChange={(v) => setBoolean("kaysAuthorizedSignatoryReady", v)}
        />
        <BinaryField
          label="Imza sirkuleri / yetki belgesi hazir mi?"
          value={form.hasSignatureAuthorityDocs}
          onChange={(v) => setBoolean("hasSignatureAuthorityDocs", v)}
        />
        <BinaryField
          label="Vergi levhasi hazir mi?"
          value={form.hasTaxCertificate}
          onChange={(v) => setBoolean("hasTaxCertificate", v)}
        />
        <BinaryField
          label="Ticaret sicil gazetesi hazir mi?"
          value={form.hasTradeRegistryGazette}
          onChange={(v) => setBoolean("hasTradeRegistryGazette", v)}
        />
        <BinaryField
          label="Faaliyet belgesi hazir mi?"
          value={form.hasActivityCertificate}
          onChange={(v) => setBoolean("hasActivityCertificate", v)}
        />
        <BinaryField
          label="Mali tablolar hazir mi?"
          value={form.hasFinancialStatements}
          onChange={(v) => setBoolean("hasFinancialStatements", v)}
        />
        <BinaryField
          label="Proje basvuru formu taslagi hazir mi?"
          value={form.hasApplicationFormDraft}
          onChange={(v) => setBoolean("hasApplicationFormDraft", v)}
        />
        <BinaryField
          label="Proje butcesi hazir mi?"
          value={form.hasProjectBudgetDraft}
          onChange={(v) => setBoolean("hasProjectBudgetDraft", v)}
        />
        {showGuidedSection || showSocialFlow || showLocalFlow ? (
          <BinaryField
            label="Ortaklik/istirakci belgeleri hazir mi?"
            value={form.hasPartnerAffiliateDocs}
            onChange={(v) => setBoolean("hasPartnerAffiliateDocs", v)}
          />
        ) : null}
        <BinaryField
          label="Taahhutnameler hazir mi?"
          value={form.hasCommitmentLetters}
          onChange={(v) => setBoolean("hasCommitmentLetters", v)}
        />
        {showInvestmentFlow || showFizibiliteSection || showGuidedSection ? (
          <BinaryField
            label="Es finansman beyani hazir mi?"
            value={form.hasCoFinanceDeclaration}
            onChange={(v) => setBoolean("hasCoFinanceDeclaration", v)}
          />
        ) : null}
        <BinaryField
          label="Proje uygulama takvimi hazir mi?"
          value={form.hasProjectTimeline}
          onChange={(v) => setBoolean("hasProjectTimeline", v)}
        />
        <BinaryField
          label="Acik cagri rehberi incelendi mi?"
          value={form.reviewedOpenCallGuideline}
          onChange={(v) => setBoolean("reviewedOpenCallGuideline", v)}
        />
      </KalkinmaAjansiQuestionSection>

      <AnalysisActionBar
        onStart={handleStartAnalysis}
        onSave={handleSave}
        onReset={resetAnalysis}
        onReportPlaceholder={handleReportPlaceholder}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />

      {noNeedSelected ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
          Destek ihtiyaci tipi secili degil. En az bir baslik secildiginde ilgili degerlendirme daha dogru onceliklenir.
        </div>
      ) : null}

      <section ref={resultsSectionRef} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">11. Sonuc ve Oneriler</h2>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-emerald-800">Uygun Destekler</h3>
          {groupedResults.uygun.length ? (
            groupedResults.uygun.map((item) => <KalkinmaAjansiResultCard key={item.id} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Uygun destek bulunamadi.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-800">Potansiyel / Acik Cagri ve Ek Belgeyle Incelenecek Destekler</h3>
          {groupedResults.potansiyel.length ? (
            groupedResults.potansiyel.map((item) => <KalkinmaAjansiResultCard key={item.id} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Potansiyel destek bulunamadi.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-rose-800">Uygun Gorunmeyen / Riskli Destekler</h3>
          {groupedResults.riskli.length ? (
            groupedResults.riskli.map((item) => <KalkinmaAjansiResultCard key={item.id} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Riskli destek bulunamadi.</p>
          )}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <p>
          Bu cikti on degerlendirme niteligindedir. Kalkinma Ajanslari desteklerinde nihai uygunluk; ilgili ajansin acik
          destek programi, basvuru rehberi, bolge plani, basvuru sahibi uygunlugu, proje konusu, butce limitleri, es
          finansman, KAYS basvurusu, taahhutname sureci ve ajans degerlendirmesiyle dogrulanmalidir.
        </p>
      </footer>
    </div>
  );
}
