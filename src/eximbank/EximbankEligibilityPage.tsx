import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useAnalysisWorkspace } from "../core/analysis/useAnalysisWorkspace";
import AnalysisActionBar from "../core/components/AnalysisActionBar";
import { defaultAnalysisInfoState, type AnalysisInfoState } from "../types/analysis";
import EximbankQuestionSection from "./components/EximbankQuestionSection";
import EximbankResultCard from "./components/EximbankResultCard";
import EximbankSummaryDashboard from "./components/EximbankSummaryDashboard";
import { evaluateEximbankSupports, summarizeEximbankResults } from "./logic/evaluateEximbankSupports";
import {
  EximbankCompanyType,
  EximbankFormState,
  EximbankNeedSelection,
  EximbankNeedType,
  createInitialEximbankFormState,
  createInitialEximbankNeedSelection,
} from "./types";

interface FieldProps {
  label: string;
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

const companyTypes: EximbankCompanyType[] = [
  "Sahis",
  "Limited",
  "Anonim",
  "Kooperatif",
  "SerbestBolgeKullanicisi",
  "Diger",
];

const companyTypeLabels: Record<EximbankCompanyType, string> = {
  Sahis: "Şahıs",
  Limited: "Limited",
  Anonim: "Anonim",
  Kooperatif: "Kooperatif",
  SerbestBolgeKullanicisi: "Serbest bölge kullanıcısı",
  Diger: "Diğer",
};

const needLabels: Record<EximbankNeedType, string> = {
  sevkOncesiFinansman: "İhracat öncesi üretim/tedarik finansmanı",
  ihracataHazirlik: "İhracata hazırlık finansmanı",
  isletmeSermayesi: "İşletme sermayesi finansmanı",
  yatirimFinansmani: "İhracata yönelik yatırım finansmanı",
  alacakSigortasi: "Vadeli satış / alacak riski sigortası",
  igeKefaleti: "Teminat yetersizliği / kefalet ihtiyacı",
  yesilFinansman: "Yeşil dönüşüm / sürdürülebilir ihracat yatırımı",
  hizmetIhracatiFinansmani: "Yurt dışı proje / taahhüt / hizmet ihracatı finansmanı",
};

const creditTypeOptions = [
  { value: "Belirsiz", label: "Belirsiz" },
  { value: "IsletmeSermayesi", label: "İşletme sermayesi" },
  { value: "Yatirim", label: "Yatırım" },
  { value: "IhracatFinansmani", label: "İhracat finansmanı" },
] as const;

const targetCountryOptions = [
  "Almanya",
  "Amerika Birleşik Devletleri",
  "Avusturya",
  "Azerbaycan",
  "Belçika",
  "Birleşik Arap Emirlikleri",
  "Birleşik Krallık",
  "Bulgaristan",
  "Cezayir",
  "Çin",
  "Fas",
  "Fransa",
  "Gürcistan",
  "Hollanda",
  "Irak",
  "İspanya",
  "İsrail",
  "İtalya",
  "Japonya",
  "Katar",
  "Kazakistan",
  "Mısır",
  "Polonya",
  "Romanya",
  "Rusya",
  "Sırbistan",
  "Suudi Arabistan",
  "Tunus",
  "Ukrayna",
  "Ürdün",
] as const;

const parseTargetCountries = (value: string): string[] =>
  value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

export default function EximbankEligibilityPage() {
  const [selection, setSelection] = useState<EximbankNeedSelection>(createInitialEximbankNeedSelection);
  const [form, setForm] = useState<EximbankFormState>(createInitialEximbankFormState);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfoState>(defaultAnalysisInfoState);
  const resultsSectionRef = useRef<HTMLElement | null>(null);
  const targetCountryDropdownRef = useRef<HTMLDivElement | null>(null);
  const [isTargetCountryDropdownOpen, setIsTargetCountryDropdownOpen] = useState(false);

  const results = useMemo(() => evaluateEximbankSupports(form, selection), [form, selection]);
  const summary = useMemo(() => summarizeEximbankResults(results, form, selection), [results, form, selection]);

  const groupedResults = useMemo(
    () => ({
      uygun: results.filter((item) => item.status === "UYGUN"),
      potansiyel: results.filter((item) => item.status === "POTANSIYEL"),
      riskli: results.filter((item) => item.status === "UYGUN DEGIL / RISKLI"),
    }),
    [results],
  );

  const updateField = <K extends keyof EximbankFormState>(key: K, value: EximbankFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBoolean = (key: keyof EximbankFormState, value: boolean) => updateField(key, value as EximbankFormState[typeof key]);
  const setString = (key: keyof EximbankFormState, value: string) => updateField(key, value as EximbankFormState[typeof key]);
  const setNumber = (key: keyof EximbankFormState, value: number) =>
    updateField(key, (Number.isNaN(value) ? 0 : value) as EximbankFormState[typeof key]);

  const toggleNeed = (need: EximbankNeedType) => {
    setSelection((prev) => ({ ...prev, [need]: !prev[need] }));
  };

  const setAllNeeds = () => setSelection(createInitialEximbankNeedSelection());
  const clearAllNeeds = () =>
    setSelection({
      sevkOncesiFinansman: false,
      ihracataHazirlik: false,
      isletmeSermayesi: false,
      yatirimFinansmani: false,
      alacakSigortasi: false,
      igeKefaleti: false,
      yesilFinansman: false,
      hizmetIhracatiFinansmani: false,
    });

  const allNeedsSelected = Object.values(selection).every(Boolean);
  const noNeedSelected = Object.values(selection).every((item) => !item);
  const selectedTargetCountries = useMemo(() => parseTargetCountries(form.targetCountries), [form.targetCountries]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!targetCountryDropdownRef.current) return;
      if (!targetCountryDropdownRef.current.contains(event.target as Node)) {
        setIsTargetCountryDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const showShortTermSection = selection.sevkOncesiFinansman || selection.ihracataHazirlik || selection.isletmeSermayesi;
  const showLongTermSection = selection.yatirimFinansmani || selection.hizmetIhracatiFinansmani;
  const showInsuranceSection = selection.alacakSigortasi;
  const showIgeSection = selection.igeKefaleti;
  const showGreenSection = selection.yesilFinansman;

  const toggleTargetCountry = (country: string) => {
    const next = selectedTargetCountries.includes(country)
      ? selectedTargetCountries.filter((item) => item !== country)
      : [...selectedTargetCountries, country];

    setString("targetCountries", next.join(", "));
  };

  const { clearInfo, isSaving, saveMessage, handleSave, handleReportPlaceholder } = useAnalysisWorkspace({
    analysisType: "eximbank",
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
    defaultTitle: "Eximbank analizi",
  });

  const resetEximbankAnalysis = () => {
    setSelection(createInitialEximbankNeedSelection());
    setForm(createInitialEximbankFormState());
    clearInfo();
  };

  const handleStartAnalysis = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Türk Eximbank ve Finansman Destekleri Uygunluk Aracı</h1>
        <p className="mt-1 text-sm text-slate-700">
          Mali müşavirlik, bağımsız denetim ve ihracat danışmanlığı ekipleri için Eximbank kredileri, alacak sigortası, IGE kefaleti
          ve ihracat finansmanı araçlarında ön uygunluk değerlendirme ekranı.
        </p>
      </header>

      <EximbankSummaryDashboard summary={summary} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Finansman ihtiyacı tipi seçimi</h2>
        <p className="mt-1 text-sm text-slate-600">Birden fazla ihtiyaç seçebilirsiniz. Seçime göre ilgili soru grupları açılır.</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={setAllNeeds}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${allNeedsSelected ? "bg-brand-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
          >
            Tümü
          </button>
          <button
            type="button"
            onClick={clearAllNeeds}
            className={`rounded-lg px-4 py-2 text-sm font-semibold ${noNeedSelected ? "bg-brand-700 text-white" : "border border-slate-300 bg-white text-slate-700"}`}
          >
            Temizle
          </button>
          {(Object.keys(needLabels) as EximbankNeedType[]).map((needKey) => (
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

      <EximbankQuestionSection title="1. Firma Genel Bilgileri">
        <BinaryField label="Firma Türkiye'de yerleşik mi?" value={form.isTurkeyResident} onChange={(v) => setBoolean("isTurkeyResident", v)} />
        <Field label="Firma türü">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.companyType} onChange={(e) => setString("companyType", e.target.value)}>
            {companyTypes.map((type) => (
              <option key={type} value={type}>
                {companyTypeLabels[type]}
              </option>
            ))}
          </select>
        </Field>
        <BinaryField label="Firma KOBİ mi?" value={form.isKobi} onChange={(v) => setBoolean("isKobi", v)} />
        <BinaryField label="Firma büyük ölçekli mi?" value={form.isLargeEnterprise} onChange={(v) => setBoolean("isLargeEnterprise", v)} />
        <BinaryField label="Firma ihracatçı mı?" value={form.isExporter} onChange={(v) => setBoolean("isExporter", v)} />
        <BinaryField label="Firma imalatçı-ihracatçı mı?" value={form.isManufacturerExporter} onChange={(v) => setBoolean("isManufacturerExporter", v)} />
        <BinaryField label="Firma ihracata yönelik mal üreten imalatçı mı?" value={form.isExportOrientedManufacturer} onChange={(v) => setBoolean("isExportOrientedManufacturer", v)} />
        <BinaryField label="Firma döviz kazandırıcı hizmet sunuyor mu?" value={form.hasForeignCurrencyService} onChange={(v) => setBoolean("hasForeignCurrencyService", v)} />
        <BinaryField label="Firma ihracatçı birliğine üye mi?" value={form.isExporterUnionMember} onChange={(v) => setBoolean("isExporterUnionMember", v)} />
        <BinaryField label="Firma son 12 ayda ihracat yaptı mı?" value={form.exportedLast12Months} onChange={(v) => setBoolean("exportedLast12Months", v)} />
        <BinaryField label="Firma daha önce Türk Eximbank kredisi kullandı mı?" value={form.usedEximbankCreditBefore} onChange={(v) => setBoolean("usedEximbankCreditBefore", v)} />
        <BinaryField label="Firma daha önce Eximbank alacak sigortası kullandı mı?" value={form.usedEximbankInsuranceBefore} onChange={(v) => setBoolean("usedEximbankInsuranceBefore", v)} />
        <BinaryField label="Firma daha önce IGE kefaleti kullandı mı?" value={form.usedIgeGuaranteeBefore} onChange={(v) => setBoolean("usedIgeGuaranteeBefore", v)} />
        <BinaryField label="Firma kredi sicili/finansal skoru açısından riskli mi?" value={form.hasCreditRisk} onChange={(v) => setBoolean("hasCreditRisk", v)} />
        <BinaryField label="Vergi / SGK borcu var mı?" value={form.hasTaxOrSgkDebt} onChange={(v) => setBoolean("hasTaxOrSgkDebt", v)} />
        <BinaryField label="Firmanın güncel mali tabloları hazır mı?" value={form.hasCurrentFinancialStatements} onChange={(v) => setBoolean("hasCurrentFinancialStatements", v)} />
        <BinaryField label="Firmanın bağımsız denetim raporu veya mizanı hazır mı?" value={form.hasIndependentAuditOrTrialBalance} onChange={(v) => setBoolean("hasIndependentAuditOrTrialBalance", v)} />
      </EximbankQuestionSection>

      <EximbankQuestionSection title="2. İhracat ve Satış Bilgileri">
        <Field label="Son 12 ay ihracat tutarı">
          <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.last12MonthExportAmount} onChange={(e) => setNumber("last12MonthExportAmount", Number(e.target.value))} />
        </Field>
        <Field label="Yıllık hedef ihracat tutarı">
          <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.targetAnnualExportAmount} onChange={(e) => setNumber("targetAnnualExportAmount", Number(e.target.value))} />
        </Field>
        <Field label="İhracat yapılan ülke sayısı">
          <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.exportCountryCount} onChange={(e) => setNumber("exportCountryCount", Number(e.target.value))} />
        </Field>
        <Field label="Hedef ülkeler">
          <div ref={targetCountryDropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsTargetCountryDropdownOpen((prev) => !prev)}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-left text-sm text-slate-800"
            >
              {selectedTargetCountries.length > 0 ? `${selectedTargetCountries.length} ülke seçildi` : "Ülke seçiniz"}
            </button>

            {isTargetCountryDropdownOpen ? (
              <div className="absolute z-20 mt-2 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-300 bg-white p-2 shadow-lg">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs font-semibold text-slate-600">Birden fazla ülke seçebilirsiniz</p>
                  <button
                    type="button"
                    onClick={() => setString("targetCountries", "")}
                    className="text-xs font-semibold text-brand-700 hover:text-brand-800"
                  >
                    Temizle
                  </button>
                </div>
                <div className="space-y-1">
                  {targetCountryOptions.map((country) => {
                    const checked = selectedTargetCountries.includes(country);
                    return (
                      <label key={country} className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 hover:bg-slate-50">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleTargetCountry(country)}
                          className="h-4 w-4 rounded border-slate-300 text-brand-700 focus:ring-brand-500"
                        />
                        <span className="text-sm text-slate-800">{country}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}
          </div>
        </Field>
        <BinaryField label="İhracat siparişi veya sözleşmesi var mı?" value={form.hasExportOrderOrContract} onChange={(v) => setBoolean("hasExportOrderOrContract", v)} />
        <BinaryField label="Proforma / satış sözleşmesi / purchase order var mı?" value={form.hasProformaOrPurchaseOrder} onChange={(v) => setBoolean("hasProformaOrPurchaseOrder", v)} />
        <BinaryField label="İhracat beyannameleri mevcut mu?" value={form.hasExportDeclarations} onChange={(v) => setBoolean("hasExportDeclarations", v)} />
        <BinaryField label="İhracat bedelleri bankacılık kanalıyla tahsil ediliyor mu?" value={form.collectsThroughBankingChannel} onChange={(v) => setBoolean("collectsThroughBankingChannel", v)} />
        <BinaryField label="Döviz kazandırıcı hizmet faturaları var mı?" value={form.hasFxServiceInvoices} onChange={(v) => setBoolean("hasFxServiceInvoices", v)} />
        <BinaryField label="İhracat taahhüdü verilebilir mi?" value={form.canProvideExportCommitment} onChange={(v) => setBoolean("canProvideExportCommitment", v)} />
        <BinaryField label="Mal Türkiye menşeli mi?" value={form.hasTurkishOriginGoods} onChange={(v) => setBoolean("hasTurkishOriginGoods", v)} />
        <BinaryField label="Dahilde işleme rejimi kapsamında üretim/ihracat var mı?" value={form.hasDahildeIsleme} onChange={(v) => setBoolean("hasDahildeIsleme", v)} />
        <BinaryField label="Yurt dışı alıcılarla vadeli satış yapılıyor mu?" value={form.hasDeferredSales} onChange={(v) => setBoolean("hasDeferredSales", v)} />
        <Field label="Vadeli satışlarda vade kaç gün?">
          <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.deferredSalesMaturityDays} onChange={(e) => setNumber("deferredSalesMaturityDays", Number(e.target.value))} />
        </Field>
        <BinaryField label="Alıcı ülke ve alıcı riski biliniyor mu?" value={form.knowsBuyerAndCountryRisk} onChange={(v) => setBoolean("knowsBuyerAndCountryRisk", v)} />
      </EximbankQuestionSection>

      {showShortTermSection ? (
        <EximbankQuestionSection title="3. Kısa Vadeli Finansman İhtiyacı">
          <BinaryField label="İhracat öncesi hammadde, ara malı, nihai ürün veya stok finansmanı ihtiyacı var mı?" value={form.needsRawMaterialOrStockFinance} onChange={(v) => setBoolean("needsRawMaterialOrStockFinance", v)} />
          <BinaryField label="Üretim, tedarik veya sevk öncesi nakit ihtiyacı var mı?" value={form.needsPreShipmentCash} onChange={(v) => setBoolean("needsPreShipmentCash", v)} />
          <BinaryField label="İşletme giderleri için finansman ihtiyacı var mı?" value={form.needsWorkingCapitalExpenseFinance} onChange={(v) => setBoolean("needsWorkingCapitalExpenseFinance", v)} />
          <BinaryField label="Elektrik, su, doğal gaz, personel, kira veya üretim giderleri için finansman ihtiyacı var mı?" value={form.needsUtilityPersonnelExpenseFinance} onChange={(v) => setBoolean("needsUtilityPersonnelExpenseFinance", v)} />
          <BinaryField label="İhracata hazırlık aşamasında finansman ihtiyacı var mı?" value={form.needsExportPreparationFinance} onChange={(v) => setBoolean("needsExportPreparationFinance", v)} />
          <BinaryField label="Sipariş alındı ama üretim/tedarik için nakit eksik mi?" value={form.hasOrderButCashGap} onChange={(v) => setBoolean("hasOrderButCashGap", v)} />
          <BinaryField label="Aracı banka üzerinden kredi kullanmaya uygun mu?" value={form.isSuitableForIntermediaryBankCredit} onChange={(v) => setBoolean("isSuitableForIntermediaryBankCredit", v)} />
          <BinaryField label="Banka teminatı, kefalet veya teminat mektubu ihtiyacı var mı?" value={form.needsGuaranteeOrCollateralLetter} onChange={(v) => setBoolean("needsGuaranteeOrCollateralLetter", v)} />
        </EximbankQuestionSection>
      ) : null}

      {showLongTermSection ? (
        <EximbankQuestionSection title="4. Orta-Uzun Vadeli Finansman ve Yatırım">
          <BinaryField label="İhracata yönelik makine, ekipman veya tesis yatırımı var mı?" value={form.hasExportOrientedInvestment} onChange={(v) => setBoolean("hasExportOrientedInvestment", v)} />
          <BinaryField label="Yatırım ihracat kapasitesini artıracak mı?" value={form.investmentImprovesExportCapacity} onChange={(v) => setBoolean("investmentImprovesExportCapacity", v)} />
          <BinaryField label="Yatırım için harcama belgeleri var mı?" value={form.hasInvestmentExpenseDocuments} onChange={(v) => setBoolean("hasInvestmentExpenseDocuments", v)} />
          <BinaryField label="Yatırım için Yatırım Teşvik Belgesi var mı?" value={form.hasInvestmentIncentiveCertificate} onChange={(v) => setBoolean("hasInvestmentIncentiveCertificate", v)} />
          <BinaryField label="Yatırım Teşvik Belgesinde faiz desteği unsuru var mı?" value={form.investmentIncentiveHasInterestSupport} onChange={(v) => setBoolean("investmentIncentiveHasInterestSupport", v)} />
          <BinaryField label="Yeni pazar / yeni ürün / özel ihracat projesi var mı?" value={form.hasNewMarketOrProductProject} onChange={(v) => setBoolean("hasNewMarketOrProductProject", v)} />
          <BinaryField label="12 aydan uzun vadeli finansman ihtiyacı var mı?" value={form.needsLongTermFinanceOver12Months} onChange={(v) => setBoolean("needsLongTermFinanceOver12Months", v)} />
          <BinaryField label="Yurt dışı mağaza, depo, iştirak, proje veya yatırım ihtiyacı var mı?" value={form.needsOverseasProjectOrUnitFinance} onChange={(v) => setBoolean("needsOverseasProjectOrUnitFinance", v)} />
          <BinaryField label="Leasing veya banka kredisi alternatifi değerlendiriliyor mu?" value={form.evaluatesLeasingOrBankCredit} onChange={(v) => setBoolean("evaluatesLeasingOrBankCredit", v)} />
        </EximbankQuestionSection>
      ) : null}

      {showInsuranceSection ? (
        <EximbankQuestionSection title="5. Alacak Sigortası ve Risk Yönetimi">
          <BinaryField label="Yurt dışı alıcılara vadeli satış yapılıyor mu?" value={form.hasDeferredSales} onChange={(v) => setBoolean("hasDeferredSales", v)} />
          <BinaryField label="Alıcıların ödeme performansı bilinmiyor mu?" value={form.buyerPaymentPerformanceUnknown} onChange={(v) => setBoolean("buyerPaymentPerformanceUnknown", v)} />
          <BinaryField label="Yeni ülkeye veya yeni müşteriye satış planı var mı?" value={form.plansNewCountryOrBuyerSales} onChange={(v) => setBoolean("plansNewCountryOrBuyerSales", v)} />
          <BinaryField label="Politik risk, ticari risk veya tahsilat riski var mı?" value={form.hasPoliticalCommercialCollectionRisk} onChange={(v) => setBoolean("hasPoliticalCommercialCollectionRisk", v)} />
          <BinaryField label="Yurt dışı satışların tahsilat riski sigortalanmak isteniyor mu?" value={form.wantsCollectionRiskInsurance} onChange={(v) => setBoolean("wantsCollectionRiskInsurance", v)} />
          <BinaryField label="Açık hesap satış yapılıyor mu?" value={form.hasOpenAccountSales} onChange={(v) => setBoolean("hasOpenAccountSales", v)} />
          <BinaryField label="Akreditif veya banka garantisi olmadan satış yapılıyor mu?" value={form.sellsWithoutLcOrBankGuarantee} onChange={(v) => setBoolean("sellsWithoutLcOrBankGuarantee", v)} />
          <BinaryField label="Alıcı limiti ve ülke limiti ihtiyacı var mı?" value={form.needsBuyerOrCountryLimit} onChange={(v) => setBoolean("needsBuyerOrCountryLimit", v)} />
          <BinaryField label="Mevcut alacakların yaşlandırma raporu var mı?" value={form.hasReceivableAgingReport} onChange={(v) => setBoolean("hasReceivableAgingReport", v)} />
        </EximbankQuestionSection>
      ) : null}

      {showIgeSection ? (
        <EximbankQuestionSection title="6. IGE Kefaleti ve Teminat Durumu">
          <BinaryField label="Firma teminat yetersizliği nedeniyle krediye erişemiyor mu?" value={form.hasCollateralAccessProblem} onChange={(v) => setBoolean("hasCollateralAccessProblem", v)} />
          <BinaryField label="Banka kredi limiti yetersiz mi?" value={form.bankCreditLimitInsufficient} onChange={(v) => setBoolean("bankCreditLimitInsufficient", v)} />
          <BinaryField label="IGE kefaletiyle kredi kullanmak istiyor mu?" value={form.wantsIgeGuarantee} onChange={(v) => setBoolean("wantsIgeGuarantee", v)} />
          <BinaryField label="İhracatçı birliği üyeliği var mı?" value={form.isExporterUnionMember} onChange={(v) => setBoolean("isExporterUnionMember", v)} />
          <BinaryField label="KOBİ statüsü var mı?" value={form.isKobi} onChange={(v) => setBoolean("isKobi", v)} />
          <BinaryField label="KOSGEB veri tabanı kaydı var mı?" value={form.hasKosgebDatabaseRegistration} onChange={(v) => setBoolean("hasKosgebDatabaseRegistration", v)} />
          <BinaryField label="Bankalarla çalışma geçmişi var mı?" value={form.hasBankingRelationshipHistory} onChange={(v) => setBoolean("hasBankingRelationshipHistory", v)} />
          <BinaryField label="IGE kefalet portalı / banka başvuru süreci için e-imza/mobil imza var mı?" value={form.hasEimzaOrMobileSign} onChange={(v) => setBoolean("hasEimzaOrMobileSign", v)} />
          <Field label="Kredi türü işletme sermayesi mi, yatırım mı, ihracat finansmanı mı?">
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.requestedCreditTypeForGuarantee} onChange={(e) => setString("requestedCreditTypeForGuarantee", e.target.value)}>
              {creditTypeOptions.map((item) => (
                <option key={item.value} value={item.value}>
                  {item.label}
                </option>
              ))}
            </select>
          </Field>
        </EximbankQuestionSection>
      ) : null}

      {showGreenSection ? (
        <EximbankQuestionSection title="7. Yeşil İhracat ve Sürdürülebilir Finansman">
          <BinaryField label="Firma AB'ye ihracat yapıyor mu?" value={form.exportsToEu} onChange={(v) => setBoolean("exportsToEu", v)} />
          <BinaryField label="CBAM / karbon düzenlemesi riski var mı?" value={form.hasCbamRisk} onChange={(v) => setBoolean("hasCbamRisk", v)} />
          <BinaryField label="Enerji verimliliği yatırımı var mı?" value={form.hasEnergyEfficiencyInvestment} onChange={(v) => setBoolean("hasEnergyEfficiencyInvestment", v)} />
          <BinaryField label="Yeşil üretim / kaynak verimliliği / atık azaltımı projesi var mı?" value={form.hasGreenTransformationProject} onChange={(v) => setBoolean("hasGreenTransformationProject", v)} />
          <BinaryField label="Yenilenebilir enerji yatırımı var mı?" value={form.hasRenewableEnergyInvestment} onChange={(v) => setBoolean("hasRenewableEnergyInvestment", v)} />
          <BinaryField label="Sürdürülebilirlik raporu, karbon ayak izi veya yeşil dönüşüm yol haritası var mı?" value={form.hasSustainabilityRoadmap} onChange={(v) => setBoolean("hasSustainabilityRoadmap", v)} />
          <BinaryField label="Yeşil dönüşüm yatırımı ihracat kapasitesi veya rekabet gücüyle ilişkili mi?" value={form.greenInvestmentLinkedToExportCompetitiveness} onChange={(v) => setBoolean("greenInvestmentLinkedToExportCompetitiveness", v)} />
          <BinaryField label="Harcama belgeleri ve teknik proje hazır mı?" value={form.hasTechnicalProjectAndExpensePlan} onChange={(v) => setBoolean("hasTechnicalProjectAndExpensePlan", v)} />
        </EximbankQuestionSection>
      ) : null}

      <EximbankQuestionSection title="8. Belge ve Başvuru Hazırlığı">
        <BinaryField label="Vergi levhası hazır mı?" value={form.hasTaxCertificate} onChange={(v) => setBoolean("hasTaxCertificate", v)} />
        <BinaryField label="Ticaret sicil gazetesi hazır mı?" value={form.hasTradeRegistryGazette} onChange={(v) => setBoolean("hasTradeRegistryGazette", v)} />
        <BinaryField label="İmza sirküleri hazır mı?" value={form.hasSignatureCircular} onChange={(v) => setBoolean("hasSignatureCircular", v)} />
        <BinaryField label="Faaliyet belgesi hazır mı?" value={form.hasActivityCertificate} onChange={(v) => setBoolean("hasActivityCertificate", v)} />
        <BinaryField label="Güncel mizan hazır mı?" value={form.hasCurrentTrialBalance} onChange={(v) => setBoolean("hasCurrentTrialBalance", v)} />
        <BinaryField label="Son 2-3 yıl mali tablolar hazır mı?" value={form.hasLast2to3YearFinancials} onChange={(v) => setBoolean("hasLast2to3YearFinancials", v)} />
        <BinaryField label="Kurumlar vergisi beyannamesi hazır mı?" value={form.hasCorporateTaxReturns} onChange={(v) => setBoolean("hasCorporateTaxReturns", v)} />
        <BinaryField label="İhracat beyannameleri hazır mı?" value={form.hasExportDeclarationsReady} onChange={(v) => setBoolean("hasExportDeclarationsReady", v)} />
        <BinaryField label="Satış sözleşmeleri / sipariş formları hazır mı?" value={form.hasSalesContractsAndOrders} onChange={(v) => setBoolean("hasSalesContractsAndOrders", v)} />
        <BinaryField label="Faturalar ve ödeme kayıtları hazır mı?" value={form.hasInvoicesAndPaymentRecords} onChange={(v) => setBoolean("hasInvoicesAndPaymentRecords", v)} />
        <BinaryField label="İhracat taahhüdü belgeleri hazırlanabilir mi?" value={form.canPrepareExportCommitmentDocuments} onChange={(v) => setBoolean("canPrepareExportCommitmentDocuments", v)} />
        <BinaryField label="Harcama belgeleri hazır mı?" value={form.hasExpenseDocuments} onChange={(v) => setBoolean("hasExpenseDocuments", v)} />
        <BinaryField label="Kredi talep formu hazırlanabilir mi?" value={form.canPrepareCreditRequestForm} onChange={(v) => setBoolean("canPrepareCreditRequestForm", v)} />
        <BinaryField label="Alacak yaşlandırma ve müşteri listesi var mı?" value={form.hasBuyerListAndAging} onChange={(v) => setBoolean("hasBuyerListAndAging", v)} />
        <BinaryField label="Yurt dışı alıcı bilgileri var mı?" value={form.hasForeignBuyerInformation} onChange={(v) => setBoolean("hasForeignBuyerInformation", v)} />
        <BinaryField label="Teminat/kefalet belgeleri hazır mı?" value={form.hasCollateralDocuments} onChange={(v) => setBoolean("hasCollateralDocuments", v)} />
        <BinaryField label="IGE/KOSGEB/e-imza/mobil imza hazırlık belgeleri var mı?" value={form.hasIgeKosgebEimzaDocuments} onChange={(v) => setBoolean("hasIgeKosgebEimzaDocuments", v)} />
        <BinaryField label="Sürdürülebilirlik/yeşil dönüşüm teknik raporları var mı?" value={form.hasSustainabilityReports} onChange={(v) => setBoolean("hasSustainabilityReports", v)} />
        <BinaryField label="Eximbank/aracı banka başvuru kanalı belirli mi?" value={form.knowsApplicationChannel} onChange={(v) => setBoolean("knowsApplicationChannel", v)} />
        <BinaryField label="Faizsiz/katılım finansmanı hassasiyeti var mı?" value={form.prefersParticipationFinance} onChange={(v) => setBoolean("prefersParticipationFinance", v)} />
      </EximbankQuestionSection>

      <AnalysisActionBar
        onStart={handleStartAnalysis}
        onSave={handleSave}
        onReset={resetEximbankAnalysis}
        onReportPlaceholder={handleReportPlaceholder}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />

      {noNeedSelected ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900 shadow-sm">
          Finansman ihtiyacı tipi seçili değil. En az bir ihtiyaç tipi seçerseniz ilgili soru grupları ve sonuçlar daha doğru önceliklenir.
        </div>
      ) : null}

      <section ref={resultsSectionRef} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">9. Sonuç ve Öneriler</h2>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-emerald-800">Uygun Finansman Araçları</h3>
          {groupedResults.uygun.length ? groupedResults.uygun.map((item) => <EximbankResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Uygun finansman aracı bulunamadı.</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-800">Potansiyel / Ek Belgeyle İncelenecek Araçlar</h3>
          {groupedResults.potansiyel.length ? groupedResults.potansiyel.map((item) => <EximbankResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Potansiyel finansman aracı bulunamadı.</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-rose-800">Uygun Görünmeyen / Riskli Araçlar</h3>
          {groupedResults.riskli.length ? groupedResults.riskli.map((item) => <EximbankResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Riskli finansman aracı bulunamadı.</p>}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <p>
          Bu çıktı ön değerlendirme niteliğindedir. Türk Eximbank ve finansman desteklerinde nihai uygunluk; güncel Türk Eximbank ürün koşulları,
          kredi limiti, ihracat taahhüdü, mali analiz, teminat yapısı, aracı banka değerlendirmesi, IGE kefalet şartları, alacak sigortası limitleri
          ve ilgili kurum onay süreçleriyle doğrulanmalıdır.
        </p>
        <p className="mt-2 font-medium">
          Bu modülde gösterilen araçlar hibe değil, ağırlıklı olarak geri ödemeli kredi, kefalet, garanti veya sigorta ürünleridir.
        </p>
      </footer>
    </div>
  );
}



