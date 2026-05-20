import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { buildInitialWorkspaceState, useAnalysisWorkspace } from "../core/analysis/useAnalysisWorkspace";
import AnalysisActionBar from "../core/components/AnalysisActionBar";
import AnalysisInfoCard from "../core/components/AnalysisInfoCard";
import type { AnalysisInfoState } from "../types/analysis";
import { repairTurkishText } from "../core/text/repairTurkishText";
import NaceSelector from "../core/components/NaceSelector";
import { turkeyCities } from "../core/data/turkeyCities";
import turkeyDistricts from "../core/data/turkeyDistricts.json";
import YatirimTesvikQuestionSection from "./components/YatirimTesvikQuestionSection";
import YatirimTesvikResultCard from "./components/YatirimTesvikResultCard";
import YatirimTesvikSummaryDashboard from "./components/YatirimTesvikSummaryDashboard";
import { evaluateYatirimTesvik, summarizeYatirimTesvik } from "./logic/evaluateYatirimTesvik";
import {
  CreditCurrency,
  FinancingModel,
  InvestorCompanyType,
  InvestmentType,
  LocationZoneType,
  SpendingTiming,
  YatirimTesvikFormState,
  createInitialYatirimTesvikFormState,
} from "./types";

interface FieldProps {
  label: ReactNode;
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
    .replace(/ü/g, "u");

function Field({ label, children }: FieldProps) {
  return (
    <div className="block rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
      <span className="mb-2 block font-medium">{typeof label === "string" ? repairTurkishText(label) : label}</span>
      {children}
    </div>
  );
}

function BinaryField({ label, value, onChange }: { label: string; value: boolean; onChange: (value: boolean) => void }) {
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

const companyTypes: InvestorCompanyType[] = ["Sahis", "Limited", "Anonim", "Kooperatif", "YabanciSermayeli", "Diger"];
const financingModels: FinancingModel[] = ["OzKaynak", "BankaKredisi", "Leasing", "Yatirimci", "Karma"];
const investmentTypes: InvestmentType[] = ["YeniYatirim", "Tevsi", "Modernizasyon", "UrunCesitlendirme", "Entegrasyon", "KompleYeniTesis"];
const zoneTypes: LocationZoneType[] = ["OSB", "EndustriBolgesi", "SerbestBolge", "Teknopark", "Diger", "Yok"];
const creditCurrencies: CreditCurrency[] = ["Yok", "TL", "Doviz"];
const spendingTimings: SpendingTiming[] = ["BelgeOncesi", "BelgeSonrasi", "Karisik"];

const companyTypeLabels: Record<InvestorCompanyType, string> = {
  Sahis: "Şahıs",
  Limited: "Limited",
  Anonim: "Anonim",
  Kooperatif: "Kooperatif",
  YabanciSermayeli: "Yabancı sermayeli",
  Diger: "Diğer",
};

const financingLabels: Record<FinancingModel, string> = {
  OzKaynak: "Öz kaynak",
  BankaKredisi: "Banka kredisi",
  Leasing: "Leasing",
  Yatirimci: "Yatırımcı",
  Karma: "Karma",
};

const investmentTypeLabels: Record<InvestmentType, string> = {
  YeniYatirim: "Yeni yatırım",
  Tevsi: "Tevsi / kapasite artışı",
  Modernizasyon: "Modernizasyon",
  UrunCesitlendirme: "Ürün çeşitlendirme",
  Entegrasyon: "Entegrasyon",
  KompleYeniTesis: "Komple yeni tesis",
};

const zoneTypeLabels: Record<LocationZoneType, string> = {
  OSB: "OSB",
  EndustriBolgesi: "Endüstri bölgesi",
  SerbestBolge: "Serbest bölge",
  Teknopark: "Teknopark",
  Diger: "Diğer",
  Yok: "Yok",
};

const creditLabels: Record<CreditCurrency, string> = {
  Yok: "Yok",
  TL: "TL",
  Doviz: "Döviz",
};

const spendingLabels: Record<SpendingTiming, string> = {
  BelgeOncesi: "Belge öncesi",
  BelgeSonrasi: "Belge sonrası",
  Karisik: "Karışık",
};

const investmentSubjectOptions = [
  "Makine-ekipman üretim hattı yatırımı",
  "Yüksek teknoloji üretimi (yarı iletken, batarya, elektronik)",
  "Yazılım, otomasyon ve dijital dönüşüm yatırımı",
  "Enerji verimliliği, yeşil dönüşüm ve karbon azaltımı yatırımı",
  "Yenilenebilir enerji ve enerji altyapısı yatırımı",
  "İhracat odaklı üretim kapasitesi artırımı",
  "İthal ikamesi ve stratejik ürün üretimi",
  "Lojistik, depolama ve tedarik zinciri yatırımı",
  "Tarım, gıda ve kırsal sanayi yatırımı",
  "Turizm, sağlık, eğitim veya hizmet sektörü yatırımı",
  "Ar-Ge, prototip ve teknoloji geliştirme yatırımı",
  "Diğer uygun yatırım konusu",
] as const;

const advancedTechnologyOptions = [
  "Savunma ve havacılık teknolojileri",
  "Batarya ve enerji depolama teknolojileri",
  "Yarı iletken ve mikroelektronik",
  "Biyoteknoloji ve medikal teknolojiler",
  "Yapay zekâ ve veri teknolojileri",
  "Robotik, otomasyon ve Endüstri 4.0",
  "İleri malzeme ve nanoteknoloji",
  "Yenilenebilir enerji teknolojileri",
  "Kritik maden işleme teknolojileri",
  "Diğer ileri teknoloji alanı",
] as const;

const regionalCategoryOptions = [
  "Gelişmiş bölge (1-2. bölge)",
  "Orta gelişmiş bölge (3-4. bölge)",
  "Dezavantajlı bölge (5-6. bölge)",
  "Deprem/özel destek bölgesi",
  "OSB içi öncelikli alan",
  "Belirsiz / değerlendirme gerekli",
] as const;

const regionalCategoryInfoText =
  "Bu alan, yatırımın hangi teşvik bölgesi mantığında değerlendirileceğini işaretler. Gelişmiş bölgelerde destek yoğunluğu genelde daha sınırlı, dezavantajlı bölgelerde daha yüksek olabilir. Nihai bölgesel sınıflandırma il, ilçe, OSB/alt bölge durumu ve güncel teşvik mevzuatına göre netleştirilir.";

export default function YatirimTesvikEligibilityPage() {
  const initialWorkspace = buildInitialWorkspaceState<YatirimTesvikFormState>(
    "yatirim_tesvik",
    createInitialYatirimTesvikFormState,
  );
  const [form, setForm] = useState<YatirimTesvikFormState>(initialWorkspace.form);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfoState>(initialWorkspace.info);
  const resultsSectionRef = useRef<HTMLElement | null>(null);

  const investmentDistrictOptions = useMemo(() => {
    if (!form.investmentCity) {
      return [] as string[];
    }

    const normalizedSelectedCity = normalizeLocationKey(form.investmentCity);
    const cityMatch = (turkeyDistricts as TurkeyDistrictCity[]).find(
      (city) => normalizeLocationKey(city.name) === normalizedSelectedCity,
    );

    return cityMatch?.districts.map((district) => district.name) ?? [];
  }, [form.investmentCity]);

  useEffect(() => {
    if (!form.investmentDistrict) {
      return;
    }

    const hasSelectedDistrict = investmentDistrictOptions.some(
      (district) => normalizeLocationKey(district) === normalizeLocationKey(form.investmentDistrict),
    );

    if (!hasSelectedDistrict) {
      setForm((prev) => ({ ...prev, investmentDistrict: "" }));
    }
  }, [form.investmentDistrict, investmentDistrictOptions]);

  const results = useMemo(() => evaluateYatirimTesvik(form), [form]);
  const summary = useMemo(() => summarizeYatirimTesvik(results, form), [results, form]);

  const grouped = useMemo(
    () => ({
      uygun: results.filter((item) => item.status === "UYGUN"),
      potansiyel: results.filter((item) => item.status.startsWith("POTANS")),
      riskli: results.filter((item) => item.status !== "UYGUN" && !item.status.startsWith("POTANS")),
    }),
    [results],
  );

  const updateField = <K extends keyof YatirimTesvikFormState>(key: K, value: YatirimTesvikFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBoolean = (key: keyof YatirimTesvikFormState, value: boolean) => updateField(key, value as YatirimTesvikFormState[typeof key]);
  const setString = (key: keyof YatirimTesvikFormState, value: string) => updateField(key, value as YatirimTesvikFormState[typeof key]);
  const setNumber = (key: keyof YatirimTesvikFormState, value: number) =>
    updateField(key, (Number.isNaN(value) ? 0 : value) as YatirimTesvikFormState[typeof key]);

  const { setInfoField, clearInfo, isSaving, saveMessage, handleSave, handleReportPlaceholder } = useAnalysisWorkspace({
    analysisType: "yatirim_tesvik",
    info: analysisInfo,
    setInfo: setAnalysisInfo,
    formData: form as unknown as Record<string, unknown>,
    results: {
      uygun: grouped.uygun as unknown as Array<Record<string, unknown>>,
      potansiyel: grouped.potansiyel as unknown as Array<Record<string, unknown>>,
      riskli: grouped.riskli as unknown as Array<Record<string, unknown>>,
    },
    scores: summary as unknown as Record<string, unknown>,
    defaultTitle: "Yatırım teşvik analizi",
  });

  const resetAnalysis = () => {
    setForm(createInitialYatirimTesvikFormState());
    clearInfo();
  };

  const handleStartAnalysis = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Yatırım Teşvik Uygunluk Aracı</h1>
          <p className="mt-1 text-sm text-slate-700">Sanayi ve Teknoloji Bakanlığı Yatırım Teşvik Sistemi için ön uygunluk değerlendirme ekranı.</p>
        </div>
      </header>

      <AnalysisInfoCard value={analysisInfo} onChange={setInfoField} />

      <YatirimTesvikSummaryDashboard summary={summary} />

      <YatirimTesvikQuestionSection title="1. Firma ve Yatırımcı Bilgileri">
        <BinaryField label="Firma Türkiye'de yerleşik mi?" value={form.isTurkeyResident} onChange={(v) => setBoolean("isTurkeyResident", v)} />
        <Field label="Firma türü">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.companyType} onChange={(e) => setString("companyType", e.target.value)}>
            {companyTypes.map((type) => (
              <option key={type} value={type}>{repairTurkishText(companyTypeLabels[type])}</option>
            ))}
          </select>
        </Field>
        <BinaryField label="Firma KOBİ mi?" value={form.isKobi} onChange={(v) => setBoolean("isKobi", v)} />
        <BinaryField label="Firma büyük ölçekli işletme mi?" value={form.isLargeEnterprise} onChange={(v) => setBoolean("isLargeEnterprise", v)} />
        <BinaryField label="Firma imalat sanayinde mi?" value={form.isManufacturing} onChange={(v) => setBoolean("isManufacturing", v)} />
        <Field label="Sektor alani (tarim/gida/enerji/lojistik vb.)">
          <NaceSelector value={form.sectorFocus} onChange={(value) => setString("sectorFocus", value)} />
        </Field>
        <BinaryField label="Firma daha önce yatırım teşvik belgesi aldı mı?" value={form.hasPreviousIncentiveCertificate} onChange={(v) => setBoolean("hasPreviousIncentiveCertificate", v)} />
        <BinaryField label="Mevcut açık yatırım teşvik belgesi var mı?" value={form.hasActiveIncentiveCertificate} onChange={(v) => setBoolean("hasActiveIncentiveCertificate", v)} />
        <BinaryField label="E-TUYS yetkilendirmesi yapıldı mı?" value={form.hasETuysAuthorization} onChange={(v) => setBoolean("hasETuysAuthorization", v)} />
        <BinaryField label="Vergi / SGK borcu var mı?" value={form.hasTaxOrSgkDebt} onChange={(v) => setBoolean("hasTaxOrSgkDebt", v)} />
        <Field label="Yatırım finansmanı modeli">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.financingModel} onChange={(e) => setString("financingModel", e.target.value)}>
            {financingModels.map((type) => (
              <option key={type} value={type}>{repairTurkishText(financingLabels[type])}</option>
            ))}
          </select>
        </Field>
      </YatirimTesvikQuestionSection>

      <YatirimTesvikQuestionSection title="2. Yatırımın Genel Bilgileri">
        <Field label="Yatırım tipi">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.investmentType} onChange={(e) => setString("investmentType", e.target.value)}>
            {investmentTypes.map((type) => (
              <option key={type} value={type}>{repairTurkishText(investmentTypeLabels[type])}</option>
            ))}
          </select>
        </Field>
        <BinaryField label="Yatırım yeri belli mi?" value={form.isInvestmentLocationKnown} onChange={(v) => setBoolean("isInvestmentLocationKnown", v)} />
        <Field label="Yatırım ili">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.investmentCity}
            onChange={(e) => {
              setForm((prev) => ({
                ...prev,
                investmentCity: e.target.value,
                investmentDistrict: "",
              }));
            }}
          >
            <option value="">Seçiniz</option>
            {turkeyCities.map((city) => (
              <option key={city} value={city}>
                {repairTurkishText(city)}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Yatırım ilçesi">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100"
            value={form.investmentDistrict}
            disabled={!form.investmentCity}
            onChange={(e) => setString("investmentDistrict", e.target.value)}
          >
            <option value="">{form.investmentCity ? "Seçiniz" : "Önce il seçiniz"}</option>
            {investmentDistrictOptions.map((district) => (
              <option key={district} value={district}>
                {repairTurkishText(district)}
              </option>
            ))}
          </select>
        </Field>
        <BinaryField label="Yatırım OSB içinde mi?" value={form.isInOsb} onChange={(v) => setBoolean("isInOsb", v)} />
        <Field label="Yatırım bölge tipi">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.locationZoneType} onChange={(e) => setString("locationZoneType", e.target.value)}>
            {zoneTypes.map((type) => (
              <option key={type} value={type}>{repairTurkishText(zoneTypeLabels[type])}</option>
            ))}
          </select>
        </Field>
        <Field label="Yatırım konusu">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.investmentSubject}
            onChange={(e) => setString("investmentSubject", e.target.value)}
          >
            <option value="">Seçiniz</option>
            {investmentSubjectOptions.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </Field>
        <Field label="NACE/faaliyet kodu">
          <NaceSelector value={form.naceCode} onChange={(value) => setString("naceCode", value)} />
        </Field>
        <Field label="Yatırım tutarı (TL)">
          <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.investmentAmount} onChange={(e) => setNumber("investmentAmount", Number(e.target.value))} />
        </Field>
        <BinaryField label="Asgari sabit yatırım tutarı sağlanıyor mu?" value={form.meetsMinimumFixedInvestment} onChange={(v) => setBoolean("meetsMinimumFixedInvestment", v)} />
        <Field label="Yatırım süresi (ay)">
          <input type="number" min={1} className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.investmentDurationMonths} onChange={(e) => setNumber("investmentDurationMonths", Number(e.target.value))} />
        </Field>
        <BinaryField label="Yatırıma başlanmış mı?" value={form.investmentStarted} onChange={(v) => setBoolean("investmentStarted", v)} />
        <BinaryField label="Harcamalar belge alınmadan önce yapılmış mı?" value={form.hasPreCertificateExpenses} onChange={(v) => setBoolean("hasPreCertificateExpenses", v)} />
        <BinaryField label="Yatırım ithal makine içeriyor mu?" value={form.hasImportedMachinery} onChange={(v) => setBoolean("hasImportedMachinery", v)} />
        <BinaryField label="Yatırım yerli makine içeriyor mu?" value={form.hasDomesticMachinery} onChange={(v) => setBoolean("hasDomesticMachinery", v)} />
        <BinaryField label="Yatırım inşaat harcaması içeriyor mu?" value={form.hasConstructionExpense} onChange={(v) => setBoolean("hasConstructionExpense", v)} />
        <BinaryField label="Yatırım enerji harcaması içeriyor mu?" value={form.hasEnergyExpense} onChange={(v) => setBoolean("hasEnergyExpense", v)} />
        <BinaryField label="Yatırım arsa harcaması içeriyor mu?" value={form.hasLandExpense} onChange={(v) => setBoolean("hasLandExpense", v)} />
        <BinaryField label="Yatırım bina harcaması içeriyor mu?" value={form.hasBuildingExpense} onChange={(v) => setBoolean("hasBuildingExpense", v)} />
        <BinaryField label="Yatırım yazılım/lisans harcaması içeriyor mu?" value={form.hasSoftwareLicenseExpense} onChange={(v) => setBoolean("hasSoftwareLicenseExpense", v)} />
        <BinaryField label="Yatırım altyapı harcaması içeriyor mu?" value={form.hasInfrastructureExpense} onChange={(v) => setBoolean("hasInfrastructureExpense", v)} />
      </YatirimTesvikQuestionSection>

      <YatirimTesvikQuestionSection title="3. Yatırımın Sektörel Niteliği">
        <BinaryField label="Yatırım orta-yüksek/yüksek teknoloji alanında mı?" value={form.isMediumHighOrHighTech} onChange={(v) => setBoolean("isMediumHighOrHighTech", v)} />
        <BinaryField label="Yatırım öncelikli ürün/teknoloji listeleriyle ilişkili mi?" value={form.alignsWithPriorityProductLists} onChange={(v) => setBoolean("alignsWithPriorityProductLists", v)} />
        <BinaryField label="Yatırım ithal ikamesi saşlayacak mı?" value={form.hasImportSubstitutionImpact} onChange={(v) => setBoolean("hasImportSubstitutionImpact", v)} />
        <BinaryField label="Yatırım cari açığı azaltıcı mı?" value={form.hasCurrentAccountDeficitReductionImpact} onChange={(v) => setBoolean("hasCurrentAccountDeficitReductionImpact", v)} />
        <BinaryField label="Yatırım ihracat potansiyeli taşıyor mu?" value={form.hasExportPotential} onChange={(v) => setBoolean("hasExportPotential", v)} />
        <BinaryField label="Yatırım stratejik ürün/kritik teknoloji içeriyor mu?" value={form.hasStrategicOrCriticalTechnology} onChange={(v) => setBoolean("hasStrategicOrCriticalTechnology", v)} />
        <Field label="İleri teknoloji alanı (savunma, batarya, yarı iletken vb.)">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.advancedTechnologyArea}
            onChange={(e) => setString("advancedTechnologyArea", e.target.value)}
          >
            <option value="">Seçiniz</option>
            {advancedTechnologyOptions.map((area) => (
              <option key={area} value={area}>
                {area}
              </option>
            ))}
          </select>
        </Field>
        <BinaryField label="Yatırım ilin öncelikli yatırım konularına giriyor mu?" value={form.alignsWithCityPrioritySectors} onChange={(v) => setBoolean("alignsWithCityPrioritySectors", v)} />
        <BinaryField label="Yatırım yerel tedarik zinciri/istihdam etkisi yaratıyor mu?" value={form.hasLocalSupplyOrEmploymentImpact} onChange={(v) => setBoolean("hasLocalSupplyOrEmploymentImpact", v)} />
        <BinaryField label="Yatırım turizm/sağlık/eğitim/lojistik/veri merkezi vb. alanda mı?" value={form.isInServicePriorityAreas} onChange={(v) => setBoolean("isInServicePriorityAreas", v)} />
      </YatirimTesvikQuestionSection>

      <YatirimTesvikQuestionSection title="4. Türkiye Yüzyılı Kalkınma Hamlesi Uygunluğu">
        <BinaryField label="Yatırım Teknoloji Hamlesi kapsamına girebilir mi?" value={form.fitsTechnologyHamlesi} onChange={(v) => setBoolean("fitsTechnologyHamlesi", v)} />
        <BinaryField label="Yatırım orta-yüksek/yüksek teknoloji üretimi içeriyor mu?" value={form.includesHighTechProduction} onChange={(v) => setBoolean("includesHighTechProduction", v)} />
        <BinaryField label="Yatırım Stratejik Hamle kapsamına girebilir mi?" value={form.fitsStrategicHamle} onChange={(v) => setBoolean("fitsStrategicHamle", v)} />
        <BinaryField label="Yatırım kritik ürün ve dışa bağımlılığı azaltıcı mı?" value={form.includesCriticalProductProduction} onChange={(v) => setBoolean("includesCriticalProductProduction", v)} />
        <BinaryField label="Yatırım Yerel Kalkınma Hamlesi kapsamına girebilir mi?" value={form.fitsLocalDevelopmentHamlesi} onChange={(v) => setBoolean("fitsLocalDevelopmentHamlesi", v)} />
        <BinaryField label="Yatırım ilin yerel yatırım konularıyla uyumlu mu?" value={form.alignsWithLocalProgramTopics} onChange={(v) => setBoolean("alignsWithLocalProgramTopics", v)} />
        <BinaryField label="Yatırım proje bazlı değerlendirmeye uygun büyüklükte mi?" value={form.fitsProjectBasedScale} onChange={(v) => setBoolean("fitsProjectBasedScale", v)} />
        <BinaryField label="Yatırım yeni istihdam yaratıyor mu?" value={form.createsNewEmployment} onChange={(v) => setBoolean("createsNewEmployment", v)} />
        <Field label="Öngörülen yeni istihdam sayısı">
          <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.expectedNewEmploymentCount} onChange={(e) => setNumber("expectedNewEmploymentCount", Number(e.target.value))} />
        </Field>
        <BinaryField label="Yatırım kadın/genç istihdamına katkı saşlayacak mı?" value={form.contributesWomenOrYouthEmployment} onChange={(v) => setBoolean("contributesWomenOrYouthEmployment", v)} />
        <BinaryField label="Yatırım yüksek katma değer oluşturuyor mu?" value={form.createsHighAddedValue} onChange={(v) => setBoolean("createsHighAddedValue", v)} />
      </YatirimTesvikQuestionSection>

      <YatirimTesvikQuestionSection title="5. Destek Unsuru İhtiyaçları">
        <BinaryField label="KDV istisnası ihtiyacı var mı?" value={form.needsVatExemption} onChange={(v) => setBoolean("needsVatExemption", v)} />
        <BinaryField label="Gümrük vergisi muafiyeti ihtiyacı var mı?" value={form.needsCustomDutyExemption} onChange={(v) => setBoolean("needsCustomDutyExemption", v)} />
        <BinaryField label="Vergi indirimi ihtiyacı var mı?" value={form.needsTaxReduction} onChange={(v) => setBoolean("needsTaxReduction", v)} />
        <BinaryField label="SGK işveren hissesi desteği ihtiyacı var mı?" value={form.needsSgkEmployerSupport} onChange={(v) => setBoolean("needsSgkEmployerSupport", v)} />
        <BinaryField label="SGK işçi hissesi desteği ihtiyacı var mı?" value={form.needsSgkEmployeeSupport} onChange={(v) => setBoolean("needsSgkEmployeeSupport", v)} />
        <BinaryField label="Faiz veya kâr payı desteği ihtiyacı var mı?" value={form.needsInterestSupport} onChange={(v) => setBoolean("needsInterestSupport", v)} />
        <BinaryField label="Yatırım yeri tahsisi ihtiyacı var mı?" value={form.needsInvestmentPlaceAllocation} onChange={(v) => setBoolean("needsInvestmentPlaceAllocation", v)} />
        <BinaryField label="Makine desteği/nakdi destek ihtiyacı var mı?" value={form.needsMachineryOrCashSupport} onChange={(v) => setBoolean("needsMachineryOrCashSupport", v)} />
        <BinaryField label="Enerji desteği ihtiyacı var mı?" value={form.needsEnergySupport} onChange={(v) => setBoolean("needsEnergySupport", v)} />
        <BinaryField label="KDV iadesi ihtiyacı var mı?" value={form.needsVatRefund} onChange={(v) => setBoolean("needsVatRefund", v)} />
        <BinaryField label="Nitelikli personel desteği ihtiyacı var mı?" value={form.needsQualifiedPersonnelSupport} onChange={(v) => setBoolean("needsQualifiedPersonnelSupport", v)} />
        <BinaryField label="Alım garantisi/kamu alım taahhüdü ihtiyacı var mı?" value={form.needsPurchaseGuaranteeSupport} onChange={(v) => setBoolean("needsPurchaseGuaranteeSupport", v)} />
      </YatirimTesvikQuestionSection>

      <YatirimTesvikQuestionSection title="6. Bölgesel ve Yerel Etki">
        <Field
          label={
            <span className="inline-flex items-center gap-2">
              Bölgesel kategori notu (gelişmiş/dezavantajlı vb.)
              <span className="group relative inline-flex">
                <button
                  type="button"
                  aria-label="Bölgesel kategori notu açıklaması"
                  className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  i
                </button>
                <span className="pointer-events-none absolute left-0 top-7 z-20 hidden w-80 rounded-lg border border-slate-200 bg-white p-3 text-xs font-normal leading-5 text-slate-700 shadow-lg group-hover:block group-focus-within:block">
                  {regionalCategoryInfoText}
                </span>
              </span>
            </span>
          }
        >
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.regionalCategory}
            onChange={(e) => setString("regionalCategory", e.target.value)}
          >
            <option value="">Seçiniz</option>
            {regionalCategoryOptions.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </Field>
        <BinaryField label="Yatırım deprem bölgesinde mi?" value={form.isInDisasterRegion} onChange={(v) => setBoolean("isInDisasterRegion", v)} />
        <BinaryField label="Yatırım ilçesi alt bölge desteği sağlayabilir mi?" value={form.mayGetSubRegionSupport} onChange={(v) => setBoolean("mayGetSubRegionSupport", v)} />
        <BinaryField label="Yatırım yerel tedarikçilerle çalışacak mı?" value={form.willWorkWithLocalSuppliers} onChange={(v) => setBoolean("willWorkWithLocalSuppliers", v)} />
      </YatirimTesvikQuestionSection>

      <YatirimTesvikQuestionSection title="7. Finansman ve Harcama Durumu">
        <BinaryField label="Yatırım için kredi kullanılacak mı?" value={form.willUseCredit} onChange={(v) => setBoolean("willUseCredit", v)} />
        <Field label="Kredi para birimi">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.creditCurrency} onChange={(e) => setString("creditCurrency", e.target.value)}>
            {creditCurrencies.map((type) => (
              <option key={type} value={type}>{repairTurkishText(creditLabels[type])}</option>
            ))}
          </select>
        </Field>
        <BinaryField label="Leasing kullanılacak mı?" value={form.willUseLeasing} onChange={(v) => setBoolean("willUseLeasing", v)} />
        <BinaryField label="Makine siparişleri verildi mi?" value={form.machineryOrdersPlaced} onChange={(v) => setBoolean("machineryOrdersPlaced", v)} />
        <BinaryField label="Faturalar kesildi mi?" value={form.invoicesIssued} onChange={(v) => setBoolean("invoicesIssued", v)} />
        <BinaryField label="İthalat işlemleri başladı mı?" value={form.importProcessesStarted} onChange={(v) => setBoolean("importProcessesStarted", v)} />
        <Field label="Harcama zamanlaması">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.spendingTiming} onChange={(e) => setString("spendingTiming", e.target.value)}>
            {spendingTimings.map((type) => (
              <option key={type} value={type}>{repairTurkishText(spendingLabels[type])}</option>
            ))}
          </select>
        </Field>
        <BinaryField label="Yatırımın finansal fizibilitesi hazır mı?" value={form.hasFinancialFeasibility} onChange={(v) => setBoolean("hasFinancialFeasibility", v)} />
        <BinaryField label="Kapasite raporu var mı?" value={form.hasCapacityReport} onChange={(v) => setBoolean("hasCapacityReport", v)} />
        <BinaryField label="Proforma faturalar hazır mı?" value={form.hasProformaInvoices} onChange={(v) => setBoolean("hasProformaInvoices", v)} />
        <BinaryField label="Makine listesi hazır mı?" value={form.hasMachineryList} onChange={(v) => setBoolean("hasMachineryList", v)} />
        <BinaryField label="İnşaat ruhsatı/arsa tahsisi/kira sözleşmesi var mı?" value={form.hasConstructionPermitOrLandAllocation} onChange={(v) => setBoolean("hasConstructionPermitOrLandAllocation", v)} />
      </YatirimTesvikQuestionSection>      <AnalysisActionBar
        onStart={handleStartAnalysis}
        onSave={handleSave}
        onReset={resetAnalysis}
        onReportPlaceholder={handleReportPlaceholder}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />

      <section ref={resultsSectionRef} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">8. Sonuç ve Öneriler</h2>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-emerald-800">Uygun Destekler / Uygun Teşvik Türleri</h3>
          {grouped.uygun.length ? grouped.uygun.map((item) => <YatirimTesvikResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Uygun teşvik türü bulunamadı.</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-800">Potansiyel / Ek Belgeyle İncelenecek Teşvikler</h3>
          {grouped.potansiyel.length ? grouped.potansiyel.map((item) => <YatirimTesvikResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Potansiyel teşvik bulunamadı.</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-rose-800">Uygun Görünmeyen / Riskli Teşvikler</h3>
          {grouped.riskli.length ? grouped.riskli.map((item) => <YatirimTesvikResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Riskli teşvik bulunamadı.</p>}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <p>
          Bu çıktı ön değerlendirme niteliğindedir. Yatırım teşviklerinde nihai uygunluk; güncel Yatırımlarda Devlet Yardımları mevzuatı,
          2025/9903 sayılı karar ve ilgili tebliğler, yatırım konusu, il/ilçe, asgari sabit yatırım tutarı, desteklenmeyen yatırım konuları,
          E-TUYS kontrolleri ve Sanayi ve Teknoloji Bakanlığı değerlendirmesiyle doğrulanmalıdır.
        </p>
        <p className="mt-2 font-medium">
          Yatırım teşvik sistemi 2025/9903 sayılı Cumhurbaşkanı Kararı ile yenilenmiştir. Güncel mevzuat, destek oranları, destek süreleri ve
          başvuru şartları Sanayi ve Teknoloji Bakanlığı resmi kaynaklarından kontrol edilmelidir.
        </p>
      </footer>
    </div>
  );
}








