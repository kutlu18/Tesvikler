import { ReactNode, useMemo, useRef, useState } from "react";
import { useAnalysisWorkspace } from "../core/analysis/useAnalysisWorkspace";
import AnalysisActionBar from "../core/components/AnalysisActionBar";
import { defaultAnalysisInfoState, type AnalysisInfoState } from "../types/analysis";
import { repairTurkishText } from "../core/text/repairTurkishText";
import TicaretQuestionSection from "./components/TicaretQuestionSection";
import TicaretResultCard from "./components/TicaretResultCard";
import TicaretSummaryDashboard from "./components/TicaretSummaryDashboard";
import { evaluateTicaretSupports, summarizeTicaretResults } from "./logic/evaluateTicaretSupports";
import {
  AnnualExportBand,
  CompanyType,
  SalesModel,
  ServiceSector,
  TicaretFormState,
  TicaretSupportSelection,
  createInitialSupportSelection,
  createInitialTicaretFormState,
} from "./types";

interface FieldProps {
  label: string;
  children: ReactNode;
}

function Field({ label, children }: FieldProps) {
  return (
    <div className="block rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800">
      <span className="mb-2 block font-medium">{repairTurkishText(label)}</span>
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

const companyTypes: CompanyType[] = ["Sahis", "Limited", "Anonim", "Kooperatif", "IhracatciBirligiUyesi", "Diger"];
const annualBands: AnnualExportBand[] = ["Yok", "0_100K", "100K_1M", "1M_10M", "10M_USTU"];
const salesModels: SalesModel[] = ["B2C", "B2B", "B2B2C", "Karisik"];
const serviceSectors: ServiceSector[] = [
  "BilisimYazilimSaaS",
  "Oyun",
  "SaglikTurizmi",
  "Egitim",
  "YonetimDanismanligi",
  "TeknikMusavirlik",
  "Lojistik",
  "Fuarcilik",
  "FilmDiziAnimasyon",
  "ReklamPazarlamaTasarim",
  "Diger",
];

const companyTypeLabels: Record<CompanyType, string> = {
  Sahis: "Şahıs",
  Limited: "Limited",
  Anonim: "Anonim",
  Kooperatif: "Kooperatif",
  IhracatciBirligiUyesi: "İhracatçı birliği üyesi",
  Diger: "Diğer",
};

const annualBandLabels: Record<AnnualExportBand, string> = {
  Yok: "Yok",
  "0_100K": "0 - 100 Bin USD",
  "100K_1M": "100 Bin - 1 Milyon USD",
  "1M_10M": "1 - 10 Milyon USD",
  "10M_USTU": "10 Milyon USD üzeri",
};

const salesModelLabels: Record<SalesModel, string> = {
  B2C: "B2C",
  B2B: "B2B",
  B2B2C: "B2B2C",
  Karisik: "Karışık",
};

const serviceSectorLabels: Record<ServiceSector, string> = {
  BilisimYazilimSaaS: "Bilişim / Yazılım / SaaS",
  Oyun: "Oyun",
  SaglikTurizmi: "Sağlık turizmi",
  Egitim: "Eğitim",
  YonetimDanismanligi: "Yönetim danışmanlığı",
  TeknikMusavirlik: "Teknik müşavirlik / mühendislik / mimarlık",
  Lojistik: "Lojistik",
  Fuarcilik: "Fuarcılık",
  FilmDiziAnimasyon: "Film / dizi / animasyon / yaratıcı endüstri",
  ReklamPazarlamaTasarim: "Reklam / pazarlama / tasarım",
  Diger: "Diğer",
};

export default function TicaretEligibilityPage() {
  const [selection, setSelection] = useState<TicaretSupportSelection>(createInitialSupportSelection);
  const [form, setForm] = useState<TicaretFormState>(createInitialTicaretFormState);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfoState>(defaultAnalysisInfoState);
  const resultsSectionRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => evaluateTicaretSupports(form, selection), [form, selection]);
  const summary = useMemo(() => summarizeTicaretResults(results, form), [results, form]);

  const grouped = useMemo(
    () => ({
      uygun: results.filter((item) => item.status === "UYGUN"),
      potansiyel: results.filter((item) => item.status.startsWith("POTANS")),
      riskli: results.filter((item) => item.status !== "UYGUN" && !item.status.startsWith("POTANS")),
    }),
    [results],
  );

  const allSelected = selection.mal && selection.eihracat && selection.hizmet;

  const setAllTypes = () => setSelection({ mal: true, eihracat: true, hizmet: true });

  const toggleType = (key: keyof TicaretSupportSelection) => {
    setSelection((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (!next.mal && !next.eihracat && !next.hizmet) {
        return prev;
      }
      return next;
    });
  };

  const updateField = <K extends keyof TicaretFormState>(key: K, value: TicaretFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBoolean = (key: keyof TicaretFormState, value: boolean) => updateField(key, value as TicaretFormState[typeof key]);
  const setString = (key: keyof TicaretFormState, value: string) => updateField(key, value as TicaretFormState[typeof key]);
  const setNumber = (key: keyof TicaretFormState, value: number) =>
    updateField(key, (Number.isNaN(value) ? 0 : value) as TicaretFormState[typeof key]);

  const { clearInfo, isSaving, saveMessage, handleSave, handleReportPlaceholder } = useAnalysisWorkspace({
    analysisType: "ticaret",
    info: analysisInfo,
    setInfo: setAnalysisInfo,
    formData: {
      ...form,
      selectedSupportTypes: selection,
    } as Record<string, unknown>,
    results: {
      uygun: grouped.uygun as unknown as Array<Record<string, unknown>>,
      potansiyel: grouped.potansiyel as unknown as Array<Record<string, unknown>>,
      riskli: grouped.riskli as unknown as Array<Record<string, unknown>>,
    },
    scores: summary as unknown as Record<string, unknown>,
    defaultTitle: "Ticaret Bakanlığı analizi",
  });

  const resetAnalysis = () => {
    setSelection(createInitialSupportSelection());
    setForm(createInitialTicaretFormState());
    clearInfo();
  };

  const handleStartAnalysis = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Ticaret Bakanlığı Destek Uygunluk Aracı</h1>
          <p className="mt-1 text-sm text-slate-700">Mal ihracatı, e-ihracat ve hizmet ihracatı destekleri için ön uygunluk ekranı.</p>
        </div>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-semibold text-slate-900">Destek tipi seçimi</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={setAllTypes}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${allSelected ? "bg-brand-700 text-white" : "bg-white text-slate-700 border border-slate-300"}`}
            >
              Tümü
            </button>
            <button
              type="button"
              onClick={() => toggleType("mal")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${selection.mal ? "bg-brand-700 text-white" : "bg-white text-slate-700 border border-slate-300"}`}
            >
              Mal ihracatı
            </button>
            <button
              type="button"
              onClick={() => toggleType("eihracat")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${selection.eihracat ? "bg-brand-700 text-white" : "bg-white text-slate-700 border border-slate-300"}`}
            >
              E-ihracat
            </button>
            <button
              type="button"
              onClick={() => toggleType("hizmet")}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${selection.hizmet ? "bg-brand-700 text-white" : "bg-white text-slate-700 border border-slate-300"}`}
            >
              Hizmet ihracatı
            </button>
          </div>
        </div>
      </header>

      <TicaretSummaryDashboard summary={summary} />

      <TicaretQuestionSection title="1. Firma Genel Bilgileri">
        <BinaryField label="Firma Türkiye'de yerleşik mi?" value={form.isTurkeyResident} onChange={(v) => setBoolean("isTurkeyResident", v)} />
        <Field label="Firma türü">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.companyType} onChange={(e) => setString("companyType", e.target.value)}>
            {companyTypes.map((type) => <option key={type} value={type}>{repairTurkishText(companyTypeLabels[type])}</option>)}
          </select>
        </Field>
        <BinaryField label="Firma KOBİ mi?" value={form.isKobi} onChange={(v) => setBoolean("isKobi", v)} />
        <BinaryField label="Firma üretici mi?" value={form.isProducer} onChange={(v) => setBoolean("isProducer", v)} />
        <BinaryField label="Firma imalatçı mı?" value={form.isManufacturerExporter} onChange={(v) => setBoolean("isManufacturerExporter", v)} />
        <BinaryField label="Firma ticari ihracatçı mı?" value={form.isCommercialExporter} onChange={(v) => setBoolean("isCommercialExporter", v)} />
        <BinaryField label="Firma hizmet ihracatçısı mı?" value={form.isServiceExporter} onChange={(v) => setBoolean("isServiceExporter", v)} />
        <BinaryField label="Firma e-ihracat yapıyor mu?" value={form.isEExporter} onChange={(v) => setBoolean("isEExporter", v)} />
        <BinaryField label="Firma ihracatçı birliğine üye mi?" value={form.isExporterUnionMember} onChange={(v) => setBoolean("isExporterUnionMember", v)} />
        <BinaryField label="Firma DYS kullanıyor mu?" value={form.hasDys} onChange={(v) => setBoolean("hasDys", v)} />
        <BinaryField label="Firma MERSİS kaydı güncel mi?" value={form.hasMersisCurrent} onChange={(v) => setBoolean("hasMersisCurrent", v)} />
        <BinaryField label="Firma KEP adresine sahip mi?" value={form.hasKep} onChange={(v) => setBoolean("hasKep", v)} />
        <BinaryField label="Firma e-imza/mali mühür altyapısına sahip mi?" value={form.hasESignOrFinancialSeal} onChange={(v) => setBoolean("hasESignOrFinancialSeal", v)} />
        <BinaryField label="Vergi / SGK borcu var mı?" value={form.hasTaxOrSgkDebt} onChange={(v) => setBoolean("hasTaxOrSgkDebt", v)} />
        <BinaryField label="Firma daha önce Ticaret Bakanlığı desteği aldı mı?" value={form.hasPreviousMinistrySupport} onChange={(v) => setBoolean("hasPreviousMinistrySupport", v)} />
        <BinaryField label="Firma destek başvurularında eksik belge/ret yaşadı mı?" value={form.hadPreviousMissingDocOrRejection} onChange={(v) => setBoolean("hadPreviousMissingDocOrRejection", v)} />
      </TicaretQuestionSection>

      <TicaretQuestionSection title="2. İhracat Genel Durumu">
        <BinaryField label="Firma halihazırda ihracat yapıyor mu?" value={form.currentlyExports} onChange={(v) => setBoolean("currentlyExports", v)} />
        <BinaryField label="Son 12 ayda ihracat yaptı mı?" value={form.exportedLast12Months} onChange={(v) => setBoolean("exportedLast12Months", v)} />
        <Field label="Yıllık ihracat tutarı bandı">
          <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.annualExportBand} onChange={(e) => setString("annualExportBand", e.target.value)}>
            {annualBands.map((band) => <option key={band} value={band}>{repairTurkishText(annualBandLabels[band])}</option>)}
          </select>
        </Field>
        <Field label="İhracat yapılan ülke sayısı">
          <input type="number" min={0} className="w-full rounded-lg border border-slate-300 px-3 py-2" value={form.exportCountryCount} onChange={(e) => setNumber("exportCountryCount", Number(e.target.value))} />
        </Field>
        <BinaryField label="Hedef pazarlar belirli mi?" value={form.hasTargetMarkets} onChange={(v) => setBoolean("hasTargetMarkets", v)} />
        <BinaryField label="Firma yeni pazara girmek istiyor mu?" value={form.wantsNewMarketEntry} onChange={(v) => setBoolean("wantsNewMarketEntry", v)} />
        <BinaryField label="Firma yurt dışı müşteri bulmak istiyor mu?" value={form.wantsFindForeignCustomers} onChange={(v) => setBoolean("wantsFindForeignCustomers", v)} />
        <BinaryField label="İhracat stratejisi veya pazar giriş planı hazır mı?" value={form.hasExportStrategyPlan} onChange={(v) => setBoolean("hasExportStrategyPlan", v)} />
        <BinaryField label="Yabancı dilde web/katalog/fiyat listesi hazır mı?" value={form.hasForeignLanguageSalesAssets} onChange={(v) => setBoolean("hasForeignLanguageSalesAssets", v)} />
        <BinaryField label="GTİP/NACE/hizmet sınıflandırması biliniyor mu?" value={form.knowsGtipNaceOrServiceCode} onChange={(v) => setBoolean("knowsGtipNaceOrServiceCode", v)} />
        <BinaryField label="Döviz kazandırıcı hizmet faturası kesiliyor mu?" value={form.issuesForeignCurrencyServiceInvoice} onChange={(v) => setBoolean("issuesForeignCurrencyServiceInvoice", v)} />
        <BinaryField label="Tahsilatlar bankacılık kanalıyla belgelenebiliyor mu?" value={form.canDocumentCollectionsViaBank} onChange={(v) => setBoolean("canDocumentCollectionsViaBank", v)} />
      </TicaretQuestionSection>

      {selection.mal ? (
        <TicaretQuestionSection title="3. Mal İhracatı Destekleri İçin Sorular">
          <BinaryField label="Fiziki ürün ihracatı yapılıyor mu?" value={form.hasPhysicalProductExport} onChange={(v) => setBoolean("hasPhysicalProductExport", v)} />
          <BinaryField label="Ürünler Türkiye'de üretiliyor mu?" value={form.productsProducedInTurkey} onChange={(v) => setBoolean("productsProducedInTurkey", v)} />
          <BinaryField label="Ürünler tedarik edilip ihraç mı ediliyor?" value={form.exportsSuppliedProducts} onChange={(v) => setBoolean("exportsSuppliedProducts", v)} />
          <BinaryField label="Hedef ülkede belge/sertifika/test gerekiyor mu?" value={form.needsMarketEntryCertificate} onChange={(v) => setBoolean("needsMarketEntryCertificate", v)} />
          <BinaryField label="CE/FDA/ISO vb. pazara giriş belgesi ihtiyacı var mı?" value={form.needsCeFdaIsoEtc} onChange={(v) => setBoolean("needsCeFdaIsoEtc", v)} />
          <BinaryField label="Yurt dışı marka tescili yapılacak mı?" value={form.plansForeignTrademarkRegistration} onChange={(v) => setBoolean("plansForeignTrademarkRegistration", v)} />
          <BinaryField label="Yurt dışında şirket/marka satın alma planı var mı?" value={form.plansForeignCompanyOrBrandAcquisition} onChange={(v) => setBoolean("plansForeignCompanyOrBrandAcquisition", v)} />
          <BinaryField label="Yurt dışında mağaza/ofis/depo/showroom açılacak mı?" value={form.plansForeignUnitOpening} onChange={(v) => setBoolean("plansForeignUnitOpening", v)} />
          <BinaryField label="Yurt dışında kira gideri oluşacak mı?" value={form.willHaveForeignRentExpense} onChange={(v) => setBoolean("willHaveForeignRentExpense", v)} />
          <BinaryField label="Yurt dışı tanıtım/reklam/PR/influencer çalışması yapılacak mı?" value={form.plansForeignPromotionAndAds} onChange={(v) => setBoolean("plansForeignPromotionAndAds", v)} />
          <BinaryField label="Yurt dışı fuara katılım planı var mı?" value={form.plansOverseasFairParticipation} onChange={(v) => setBoolean("plansOverseasFairParticipation", v)} />
          <BinaryField label="Yurt içi uluslararası nitelikli fuara katılım planı var mı?" value={form.plansDomesticInternationalFairParticipation} onChange={(v) => setBoolean("plansDomesticInternationalFairParticipation", v)} />
          <BinaryField label="Ticaret/alım heyetine katılmak istiyor mu?" value={form.wantsTradeDelegationParticipation} onChange={(v) => setBoolean("wantsTradeDelegationParticipation", v)} />
          <BinaryField label="UR-GE veya ihracat konsorsiyumu yapısına uygun mu?" value={form.fitsUrgeOrExportConsortium} onChange={(v) => setBoolean("fitsUrgeOrExportConsortium", v)} />
          <BinaryField label="Küresel tedarik zincirine girmek istiyor mu?" value={form.wantsGlobalSupplyChainParticipation} onChange={(v) => setBoolean("wantsGlobalSupplyChainParticipation", v)} />
          <BinaryField label="Ürün tasarımı/koleksiyon geliştirme ihtiyacı var mı?" value={form.needsDesignCollectionDevelopment} onChange={(v) => setBoolean("needsDesignCollectionDevelopment", v)} />
          <BinaryField label="Marka programı/TURQUALITY hedefi var mı?" value={form.hasTurqualityGoal} onChange={(v) => setBoolean("hasTurqualityGoal", v)} />
          <BinaryField label="Responsible / Yeşil Mutabakata Uyum ihtiyacı var mı?" value={form.needsResponsibleGreenCompliance} onChange={(v) => setBoolean("needsResponsibleGreenCompliance", v)} />
          <BinaryField label="AB ihracatı, CBAM veya sürdürülebilirlik riski var mı?" value={form.hasCbamOrSustainabilityRisk} onChange={(v) => setBoolean("hasCbamOrSustainabilityRisk", v)} />
        </TicaretQuestionSection>
      ) : null}

      {selection.eihracat ? (
        <TicaretQuestionSection title="4. E-İhracat Destekleri İçin Sorular">
          <BinaryField label="Yurt dışına online satış yapılıyor mu?" value={form.sellsOnlineAbroad} onChange={(v) => setBoolean("sellsOnlineAbroad", v)} />
          <BinaryField label="Pazaryeri üzerinden satış yapılıyor mu?" value={form.sellsViaMarketplace} onChange={(v) => setBoolean("sellsViaMarketplace", v)} />
          <BinaryField label="Kendi e-ticaret sitesiyle yurt dışına satış yapılıyor mu?" value={form.sellsViaOwnEcommerceSite} onChange={(v) => setBoolean("sellsViaOwnEcommerceSite", v)} />
          <BinaryField label="Perakende e-ticaret sitesi statüsü var mı?" value={form.isRetailEcommerceSite} onChange={(v) => setBoolean("isRetailEcommerceSite", v)} />
          <BinaryField label="Pazaryeri statüsünde mi?" value={form.isMarketplaceOperator} onChange={(v) => setBoolean("isMarketplaceOperator", v)} />
          <BinaryField label="E-ihracat konsorsiyumu olabilir mi?" value={form.canBeEexportConsortium} onChange={(v) => setBoolean("canBeEexportConsortium", v)} />
          <Field label="Satış modeli">
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.salesModel} onChange={(e) => setString("salesModel", e.target.value)}>
              {salesModels.map((m) => <option key={m} value={m}>{salesModelLabels[m]}</option>)}
            </select>
          </Field>
          <BinaryField label="Yurt dışı dijital reklam yapılıyor mu?" value={form.runsDigitalAdsAbroad} onChange={(v) => setBoolean("runsDigitalAdsAbroad", v)} />
          <BinaryField label="Pazaryeri komisyon gideri ödeniyor mu?" value={form.paysMarketplaceCommissions} onChange={(v) => setBoolean("paysMarketplaceCommissions", v)} />
          <BinaryField label="Yurt dışı depo/fulfillment/iade merkezi kullanılıyor mu?" value={form.usesForeignFulfillmentOrReturnCenter} onChange={(v) => setBoolean("usesForeignFulfillmentOrReturnCenter", v)} />
          <BinaryField label="Mikro ihracat veya ETGB süreçleri kullanılıyor mu?" value={form.usesMicroExportOrEtgb} onChange={(v) => setBoolean("usesMicroExportOrEtgb", v)} />
          <BinaryField label="Lokalizasyon/çeviri/görsel üretim gideri var mı?" value={form.hasLocalizationContentCosts} onChange={(v) => setBoolean("hasLocalizationContentCosts", v)} />
          <BinaryField label="E-ihracat yazılım/entegrasyon altyapısı kuruluyor mu?" value={form.buildsEexportSoftwareIntegration} onChange={(v) => setBoolean("buildsEexportSoftwareIntegration", v)} />
          <BinaryField label="Hedef ülkeye göre dijital pazarlama planı hazır mı?" value={form.hasTargetCountryDigitalPlan} onChange={(v) => setBoolean("hasTargetCountryDigitalPlan", v)} />
          <BinaryField label="Yurt dışı marka tescili veya alan adı alınacak mı?" value={form.plansForeignTrademarkOrDomain} onChange={(v) => setBoolean("plansForeignTrademarkOrDomain", v)} />
          <BinaryField label="Satış/komisyon/reklam harcamaları belgelenebiliyor mu?" value={form.canDocumentEexportSalesAndCosts} onChange={(v) => setBoolean("canDocumentEexportSalesAndCosts", v)} />
        </TicaretQuestionSection>
      ) : null}

      {selection.hizmet ? (
        <TicaretQuestionSection title="5. Hizmet İhracatı Destekleri İçin Sorular">
          <BinaryField label="Firma hizmet ihracatı yapıyor mu?" value={form.providesServiceExport} onChange={(v) => setBoolean("providesServiceExport", v)} />
          <BinaryField label="Hizmet yurt dışındaki müşteriye mi sunuluyor?" value={form.serviceDeliveredToForeignCustomer} onChange={(v) => setBoolean("serviceDeliveredToForeignCustomer", v)} />
          <BinaryField label="Hizmet geliri döviz olarak mı tahsil ediliyor?" value={form.collectsRevenueInForeignCurrency} onChange={(v) => setBoolean("collectsRevenueInForeignCurrency", v)} />
          <BinaryField label="Hizmet faturası yurt dışı müşteriye kesiliyor mu?" value={form.issuesInvoiceToForeignCustomer} onChange={(v) => setBoolean("issuesInvoiceToForeignCustomer", v)} />
          <Field label="Hizmet ihracatı sektörü">
            <select className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2" value={form.serviceSector} onChange={(e) => setString("serviceSector", e.target.value)}>
              {serviceSectors.map((s) => <option key={s} value={s}>{serviceSectorLabels[s]}</option>)}
            </select>
          </Field>
          <BinaryField label="Yurt dışında reklam/tanıtım yapılıyor mu?" value={form.runsServicePromotionAbroad} onChange={(v) => setBoolean("runsServicePromotionAbroad", v)} />
          <BinaryField label="Yurt dışı etkinlik/fuar/B2B görüşmeye katılıyor mu?" value={form.joinsServiceEventsB2B} onChange={(v) => setBoolean("joinsServiceEventsB2B", v)} />
          <BinaryField label="Yurt dışı birim/ofis/temsilcilik açılacak mı?" value={form.plansServiceForeignOffice} onChange={(v) => setBoolean("plansServiceForeignOffice", v)} />
          <BinaryField label="Yurt dışı marka tescili yapılacak mı?" value={form.plansServiceForeignTrademark} onChange={(v) => setBoolean("plansServiceForeignTrademark", v)} />
          <BinaryField label="Pazara giriş raporu/danışmanlığı alınacak mı?" value={form.needsMarketEntryReportOrConsultancy} onChange={(v) => setBoolean("needsMarketEntryReportOrConsultancy", v)} />
          <BinaryField label="Belgelendirme/akreditasyon/ruhsat ihtiyacı var mı?" value={form.needsCertificationAccreditationLicense} onChange={(v) => setBoolean("needsCertificationAccreditationLicense", v)} />
          <BinaryField label="Sağlık turizmi yetki/HealthTürkiye süreçleri var mı?" value={form.hasHealthTourismAuthorizationProcess} onChange={(v) => setBoolean("hasHealthTourismAuthorizationProcess", v)} />
          <BinaryField label="SaaS/lisans/abonelik veya proje bazlı hizmet ihracatı var mı?" value={form.hasSaasLicenseSubscriptionExport} onChange={(v) => setBoolean("hasSaasLicenseSubscriptionExport", v)} />
          <BinaryField label="Oyun/app store geliri/publisher anlaşması var mı?" value={form.hasGameRevenueAndPublisherAgreements} onChange={(v) => setBoolean("hasGameRevenueAndPublisherAgreements", v)} />
          <BinaryField label="Uluslararası eğitim/online eğitim geliri var mı?" value={form.hasInternationalEducationRevenue} onChange={(v) => setBoolean("hasInternationalEducationRevenue", v)} />
        </TicaretQuestionSection>
      ) : null}

      <TicaretQuestionSection title="6. Harcama ve Belge Durumu">
        <BinaryField label="Harcama yapıldı mı?" value={form.expenseIncurred} onChange={(v) => setBoolean("expenseIncurred", v)} />
        <BinaryField label="Harcama öncesi başvuru/onay gerekliliği kontrol edildi mi?" value={form.checkedPreApprovalOrOnayRequirement} onChange={(v) => setBoolean("checkedPreApprovalOrOnayRequirement", v)} />
        <BinaryField label="Fatura/dekont/sözleşme/kanıt belgeleri var mı?" value={form.hasInvoicesDecotsContractsAndProof} onChange={(v) => setBoolean("hasInvoicesDecotsContractsAndProof", v)} />
        <BinaryField label="Harcamalar şirket banka hesabından mı ödendi?" value={form.paymentsFromCompanyBankAccount} onChange={(v) => setBoolean("paymentsFromCompanyBankAccount", v)} />
        <BinaryField label="Harcama yurt dışı hedef pazara yönelik mi?" value={form.expenseTargetsForeignMarket} onChange={(v) => setBoolean("expenseTargetsForeignMarket", v)} />
        <BinaryField label="Harcama mevzuattaki süre içinde başvuruya konu edilebilir mi?" value={form.withinApplicationTimeLimit} onChange={(v) => setBoolean("withinApplicationTimeLimit", v)} />
        <BinaryField label="Giderin başka kamu desteğiyle desteklenmediği teyit edildi mi?" value={form.notFundedByOtherPublicSupport} onChange={(v) => setBoolean("notFundedByOtherPublicSupport", v)} />
        <BinaryField label="Belgeler çeviri/apostil gerektiriyor mu?" value={form.needsTranslationOrApostille} onChange={(v) => setBoolean("needsTranslationOrApostille", v)} />
        <BinaryField label="Başvuru mercii (ihracatçı birliği/Bakanlık/GM) biliniyor mu?" value={form.knowsApplicationAuthority} onChange={(v) => setBoolean("knowsApplicationAuthority", v)} />
        <BinaryField label="Başvurunun DYS/KEP/e-imza yolu net mi?" value={form.knowsDysKepEsignSubmissionPath} onChange={(v) => setBoolean("knowsDysKepEsignSubmissionPath", v)} />
        <BinaryField label="Başvuru belgeleri dijital arşivlenmiş mi?" value={form.hasDigitalDocumentArchive} onChange={(v) => setBoolean("hasDigitalDocumentArchive", v)} />
      </TicaretQuestionSection>
      <AnalysisActionBar
        onStart={handleStartAnalysis}
        onSave={handleSave}
        onReset={resetAnalysis}
        onReportPlaceholder={handleReportPlaceholder}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />

      <section ref={resultsSectionRef} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">7. Sonuç ve Öneriler</h2>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-emerald-800">Uygun Destekler</h3>
          {grouped.uygun.length ? grouped.uygun.map((item) => <TicaretResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Uygun destek bulunamadı.</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-800">Potansiyel / Ek Belgeyle İncelenecek Destekler</h3>
          {grouped.potansiyel.length ? grouped.potansiyel.map((item) => <TicaretResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Potansiyel destek bulunamadı.</p>}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-rose-800">Uygun Görünmeyen / Riskli Destekler</h3>
          {grouped.riskli.length ? grouped.riskli.map((item) => <TicaretResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Riskli destek bulunamadı.</p>}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <p>
          Bu çıktı ön değerlendirme niteliğindedir. Ticaret Bakanlığı desteklerinde nihai uygunluk; güncel 5973 sayılı İhracat Destekleri
          Hakkında Karar, 5986 sayılı E-İhracat Destekleri Hakkında Karar, 10962 sayılı Hizmet İhracatının Tanımlanması, Sınıflandırılması
          ve Hizmet Sektörlerinin Desteklenmesi Hakkında Karar, ilgili genelgeler, destek üst limitleri, başvuru süreleri, DYS kontrolleri,
          sektör/statü şartları ve Bakanlık/ihracatçı birliği değerlendirmesiyle doğrulanmalıdır.
        </p>
        <p className="mt-2 font-medium">
          Ticaret Bakanlığı desteklerinde üst limitler, oranlar, başvuru süreleri ve başvuru mercii dönemsel olarak güncellenebilir.
          Güncel bilgi Ticaret Bakanlığı resmi destek sayfaları ve ilgili genelgelerden kontrol edilmelidir.
        </p>
      </footer>
    </div>
  );
}
