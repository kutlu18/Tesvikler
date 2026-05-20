import { ReactNode, useMemo, useRef, useState } from "react";
import { useAnalysisWorkspace } from "../core/analysis/useAnalysisWorkspace";
import AnalysisActionBar from "../core/components/AnalysisActionBar";
import { defaultAnalysisInfoState, type AnalysisInfoState } from "../types/analysis";
import VergiselTesvikQuestionSection from "./components/VergiselTesvikQuestionSection";
import VergiselTesvikResultCard from "./components/VergiselTesvikResultCard";
import VergiselTesvikSummaryDashboard from "./components/VergiselTesvikSummaryDashboard";
import {
  evaluateVergiselTesvikSupports,
  summarizeVergiselTesvikResults,
} from "./logic/evaluateVergiselTesvikSupports";
import {
  MukellefType,
  VergiselNeedSelection,
  VergiselNeedType,
  VergiselTesvikFormState,
  createInitialVergiselNeedSelection,
  createInitialVergiselTesvikFormState,
} from "./types";

interface FieldProps {
  label: string;
  children: ReactNode;
}

interface BooleanQuestion {
  key: keyof VergiselTesvikFormState;
  label: string;
}

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

const mukellefTypes: MukellefType[] = [
  "SAHIS_ISLETMESI",
  "LIMITED_SIRKET",
  "ANONIM_SIRKET",
  "SERBEST_MESLEK",
  "KOOPERATIF",
  "SERBEST_BOLGE_KULLANICISI",
  "TEKNOKENT_FIRMASI",
  "ARGE_TASARIM_MERKEZI",
  "DIGER",
];

const mukellefTypeLabels: Record<MukellefType, string> = {
  SAHIS_ISLETMESI: "Sahis isletmesi",
  LIMITED_SIRKET: "Limited sirket",
  ANONIM_SIRKET: "Anonim sirket",
  SERBEST_MESLEK: "Serbest meslek erbabi",
  KOOPERATIF: "Kooperatif",
  SERBEST_BOLGE_KULLANICISI: "Serbest bolge kullanicisi",
  TEKNOKENT_FIRMASI: "Teknokent firmasi",
  ARGE_TASARIM_MERKEZI: "Ar-Ge/Tasarim merkezi",
  DIGER: "Diger",
};

const needLabels: Record<VergiselNeedType, string> = {
  teknokent4691: "Teknokent / 4691",
  arge5746: "Ar-Ge Merkezi / Tasarim Merkezi / 5746",
  gencGirisimci: "Genc girisimci kazanc istisnasi",
  ytbVergiAvantaj: "Yatirim tesvik belgesi vergi avantajlari",
  serbestBolge: "Serbest bolge vergi istisnalari",
  ihracatHizmetIhracati: "Ihracat / hizmet ihracati vergi avantajlari",
  vrhib: "VRHIB",
  kdvIstisnaIade: "KDV istisnasi / iadesi",
  osb: "OSB vergi avantajlari",
  lisansliDepoculuk: "Lisansli depoculuk vergi avantajlari",
  bordroOptimizasyon: "Ucret, yan hak ve bordro optimizasyonu",
};

const emptySelection: VergiselNeedSelection = {
  teknokent4691: false,
  arge5746: false,
  gencGirisimci: false,
  ytbVergiAvantaj: false,
  serbestBolge: false,
  ihracatHizmetIhracati: false,
  vrhib: false,
  kdvIstisnaIade: false,
  osb: false,
  lisansliDepoculuk: false,
  bordroOptimizasyon: false,
};

const section1Questions: BooleanQuestion[] = [
  { key: "isTaxPayerInTurkey", label: "Firma Turkiye'de vergi mukellefi mi?" },
  { key: "isIncomeTaxPayer", label: "Gelir vergisi mukellefi mi?" },
  { key: "isCorporateTaxPayer", label: "Kurumlar vergisi mukellefi mi?" },
  { key: "isKdvPayer", label: "KDV mukellefi mi?" },
  { key: "isRealProcedure", label: "Mukellef gercek usulde mi?" },
  { key: "isNewCompany", label: "Firma yeni kuruldu mu?" },
  { key: "hasTaxDebt", label: "Vergi borcu var mi?" },
  { key: "hasSgkDebt", label: "SGK borcu var mi?" },
  { key: "hasEdocsObligation", label: "E-defter/e-fatura/e-arsiv yukumlulugu var mi?" },
  { key: "worksWithAdvisor", label: "Mali musavir/YMM ile duzenli calisiyor mu?" },
  { key: "filingsRegular", label: "Son donem beyannameleri duzenli veriliyor mu?" },
  { key: "hasTaxRiskHistory", label: "Vergi incelemesi/ozel esas/riskli islem gecmisi var mi?" },
];

const section2Questions: BooleanQuestion[] = [
  { key: "hasTeknokentActivity", label: "Firma teknoloji gelistirme bolgesinde faaliyet gosteriyor mu?" },
  { key: "hasTeknokentContract", label: "Teknokent yonetici sirketiyle sozlesme iliskisi var mi?" },
  { key: "hasTeknokentActivityDoc", label: "Teknokent faaliyet belgesi var mi?" },
  { key: "hasTeknokentProjectApproval", label: "Proje onayi var mi?" },
  { key: "hasSoftwareArgeDesignProject", label: "Proje yazilim, Ar-Ge veya tasarim faaliyeti iceriyor mu?" },
  { key: "incomeOnlyFromTeknokentProject", label: "Kazanc sadece teknokent projesinden mi doguyor?" },
  { key: "tracksInOutRegionActivities", label: "Bolge ici ve disi faaliyet ayrimi yapiliyor mu?" },
  { key: "classifiesArgeSupportPersonnel", label: "Personel Ar-Ge/yazilim/destek olarak ayriliyor mu?" },
  { key: "tracksInOutRegionWorkTime", label: "Bolge ici/disi calisma sureleri takip ediliyor mu?" },
  { key: "tracksRemoteWorkAndClassification", label: "Uzaktan calisma oranlari ve siniflandirma takip ediliyor mu?" },
  { key: "evaluatesTeknokentKdvException", label: "Yazilim teslimlerinde KDV istisnasi degerlendiriliyor mu?" },
  { key: "separatesProjectIncomeInAccounting", label: "Proje gelirleri diger gelirlerden muhasebede ayriliyor mu?" },
  { key: "hasTeknokentYmmReporting", label: "Teknokent istisnasi icin YMM/mali raporlama sureci var mi?" },
];

const section3Questions: BooleanQuestion[] = [
  { key: "hasArgeCenterDoc", label: "Ar-Ge merkezi belgesi var mi?" },
  { key: "hasDesignCenterDoc", label: "Tasarim merkezi belgesi var mi?" },
  { key: "hasArgeProject", label: "Ar-Ge veya tasarim projesi var mi?" },
  { key: "hasSufficientArgePersonnel", label: "Ar-Ge/tasarim personel sayisi yeterli mi?" },
  { key: "tracksSupportPersonnelRatio", label: "Destek personeli orani takip ediliyor mu?" },
  { key: "hasTimesheetRecords", label: "Zaman cizelgesi/puantaj/proje kayitlari tutuluyor mu?" },
  { key: "tracksArgeExpensesSeparately", label: "Ar-Ge harcamalari muhasebede ayri izleniyor mu?" },
  { key: "calculatesArgeDeduction", label: "Ar-Ge indirimi hesaplaniyor mu?" },
  { key: "appliesIncomeTaxWithholdingSupport", label: "Gelir vergisi stopaj tesviki uygulaniyor mu?" },
  { key: "appliesStampTaxException", label: "Damga vergisi istisnasi uygulaniyor mu?" },
  { key: "appliesSgkEmployerSupport", label: "SGK isveren hissesi destegi uygulaniyor mu?" },
  { key: "hasCustomsOrKdvExceptionPotential", label: "Gumruk vergisi/KDV istisnasi potansiyeli olan ithalat var mi?" },
  { key: "documentsArgeQualification", label: "Harcamalarin Ar-Ge niteligi dokumante ediliyor mu?" },
];

const section4Questions: BooleanQuestion[] = [
  { key: "isRealPersonEntrepreneur", label: "Girisimci gercek kisi mi?" },
  { key: "firstIncomeTaxRegistration", label: "Ilk defa gelir vergisi mukellefi mi?" },
  { key: "underAgeLimitAtStart", label: "Mukellefiyet baslangicinda yas sarti saglaniyor mu?" },
  { key: "notifiedStartOnTime", label: "Ise baslama bildirimi suresinde yapildi mi?" },
  { key: "operatesOwnNameAndAccount", label: "Faaliyet kendi adina ve hesabina mi?" },
  { key: "allPartnersMeetYouthCriteria", label: "Ortaklik varsa tum ortaklar sartlari sagliyor mu?" },
  { key: "isBusinessTransferCase", label: "Mevcut bir isletme devri soz konusu mu?" },
  { key: "usedYoungEntrepreneurBefore", label: "Genc girisimci istisnasi daha once kullanildi mi?" },
  { key: "tracksYoungEntrepreneurLimitAndDuration", label: "Istisna tutari ve sure takibi yapiliyor mu?" },
  { key: "checksBagkur2026Status", label: "2026 sonrasi Bag-Kur prim tesviki durumu ayrica kontrol ediliyor mu?" },
];

const section5Questions: BooleanQuestion[] = [
  { key: "hasYatirimTesvikCertificate", label: "Yatirim Tesvik Belgesi var mi?" },
  { key: "hasETuysApplication", label: "E-TUYS basvurusu yapildi mi?" },
  { key: "investmentSubjectAndLocationClear", label: "Yatirim konusu ve yeri net mi?" },
  { key: "hasMachineryPurchaseForKdvException", label: "KDV istisnasi uygulanacak makine/tecizat alimi var mi?" },
  { key: "needsCustomsExemptionForImportedMachinery", label: "Ithal makine/tecizat icin gumruk muafiyeti ihtiyaci var mi?" },
  { key: "hasCorporateTaxDiscountSupport", label: "Indirimli kurumlar vergisi destek unsuru var mi?" },
  { key: "hasSgkEmployerSupportInYtb", label: "SGK isveren hissesi destegi var mi?" },
  { key: "hasInterestSupportInYtb", label: "Faiz/kar payi destegi var mi?" },
  { key: "investmentCompleted", label: "Yatirim tamamlandi mi?" },
  { key: "completionVisaDone", label: "Tamamlama vizesi yapildi mi?" },
  { key: "hasPreCertificateExpenses", label: "Belge oncesi harcama yapildi mi?" },
  { key: "machineryListMatchesDocs", label: "Makine listesi ve belgeler belge kapsami ile uyumlu mu?" },
  { key: "tracksInvestmentExpensesSeparately", label: "Yatirim harcamalari muhasebede ayri izleniyor mu?" },
];

const section6Questions: BooleanQuestion[] = [
  { key: "hasFreeZoneActivity", label: "Firma serbest bolgede faaliyet gosteriyor mu?" },
  { key: "hasFreeZoneLicense", label: "Serbest bolge faaliyet ruhsati var mi?" },
  { key: "freeZoneActivityTypeProduction", label: "Faaliyet uretim niteliginde mi?" },
  { key: "hasProductionIncomeInFreeZone", label: "Uretim faaliyetinden elde edilen kazanc var mi?" },
  { key: "hasExportSales", label: "Ihracata yonelik satis var mi?" },
  { key: "hasSalesToFreeZoneOrOtherFreeZones", label: "Serbest bolge ici/diger serbest bolgelere satis var mi?" },
  { key: "evaluatesWageTaxExceptionInFreeZone", label: "Personel ucret stopaj istisnasi degerlendiriliyor mu?" },
  { key: "evaluatesKdvCustomsStampAdvantagesInFreeZone", label: "KDV, gumruk, damga avantaji degerlendiriliyor mu?" },
  { key: "tracksFreeZoneIncomeSeparately", label: "Serbest bolge kazanclari muhasebede ayri izleniyor mu?" },
  { key: "licenseScopeMatchesIncomeTypes", label: "Ruhsat kapsami ile gelir turleri uyumlu mu?" },
];

const section7Questions: BooleanQuestion[] = [
  { key: "doesGoodsExport", label: "Mal ihracati yapiliyor mu?" },
  { key: "doesServiceExport", label: "Hizmet ihracati yapiliyor mu?" },
  { key: "hasFxServiceTypes", label: "Doviz kazandirici hizmet turleri var mi?" },
  { key: "hasExportInvoicesAndCustomsDocs", label: "Ihracat faturasi ve gumruk beyannamesi hazir mi?" },
  { key: "canProveServiceExportConditions", label: "Hizmet ihracati ispat kosullari belgelendirilebiliyor mu?" },
  { key: "appliesKdvExceptionOnExports", label: "KDV istisnasi uygulaniyor mu?" },
  { key: "receivesKdvRefund", label: "KDV iadesi aliniyor mu?" },
  { key: "evaluatesServiceExportTaxDeduction", label: "Hizmet ihracati kazanc indirimi degerlendiriliyor mu?" },
  { key: "collectsExportProceedsViaBank", label: "Ihracat bedelleri bankacilik kanaliyla tahsil ediliyor mu?" },
  { key: "needsVrhib", label: "Doviz kazandirici islemler icin VRHIB ihtiyaci var mi?" },
];

const section8Questions: BooleanQuestion[] = [
  { key: "hasFxEarningTransaction", label: "Doviz kazandirici hizmet veya islem var mi?" },
  { key: "hasExportLinkedContracts", label: "Ihracat baglantili sozlesme/ihale/proje var mi?" },
  { key: "hasStampAndFeeGeneratingTransactions", label: "Damga vergisi ve harc doguran islem var mi?" },
  { key: "willApplyVrhibViaDys", label: "DYS uzerinden VRHIB basvurusu yapilacak mi?" },
  { key: "contractSignedBeforeVrhib", label: "Belge alinmadan once sozlesme imzalandi mi?" },
  { key: "vrhibScopeMatchesAmountAndDuration", label: "Belge kapsami ile tutar/sure uyumlu mu?" },
  { key: "hasAnotherExceptionSameTransaction", label: "Ayni islem icin baska istisna uygulaniyor mu?" },
];

const section9Questions: BooleanQuestion[] = [
  { key: "hasSpecialKdvExceptionCases", label: "Roaming/tasimacilik gibi ozel KDV istisnasi var mi?" },
  { key: "hasYtbMachineryPurchaseForKdv", label: "YTB kapsaminda makine/tecizat alimi var mi?" },
  { key: "willRequestKdvRefund", label: "KDV iadesi talep edilecek mi?" },
  { key: "hasReducedRateDeliveries", label: "Indirimli orana tabi teslim var mi?" },
  { key: "hasExportRegisteredDeliveries", label: "Ihrac kayitli teslim var mi?" },
  { key: "preparesKdvRefundFile", label: "KDV iade dosyasi hazirlaniyor mu?" },
  { key: "needsYmmForKdvRefund", label: "YMM raporu gerekiyor mu?" },
  { key: "hasKdvListsAndDeclarations", label: "KDV listeleri, e-fatura ve beyanname seti hazir mi?" },
  { key: "hasSpecialPrinciplesRisk", label: "Ozel esas riski var mi?" },
];

const section10Questions: BooleanQuestion[] = [
  { key: "isInOsb", label: "Firma OSB icinde mi?" },
  { key: "hasOsbConstructionLandTransactions", label: "OSB'de bina/insaat/arsa islemi var mi?" },
  { key: "transactsWithOsbLegalEntity", label: "OSB tuzel kisiligiyle islem yapiliyor mu?" },
  { key: "evaluatesOsbTaxExemptions", label: "OSB emlak/KDV/harc muafiyet alanlari degerlendiriliyor mu?" },
  { key: "hasOsbYtbSubRegionAdvantage", label: "OSB'de YTB alt bolge etkisi degerlendiriliyor mu?" },
];

const section11Questions: BooleanQuestion[] = [
  { key: "hasMealBenefit", label: "Yemek karti / yemek bedeli uygulamasi var mi?" },
  { key: "hasTransportBenefit", label: "Yol yardimi var mi?" },
  { key: "hasBonusSystem", label: "Prim/bonus sistemi var mi?" },
  { key: "hasPrivateHealthOrBesContribution", label: "Ozel saglik sigortasi veya BES katkisi var mi?" },
  { key: "hasBoardAllowancePayment", label: "Huzur hakki odemesi var mi?" },
  { key: "hasExecutiveCompensations", label: "Yonetici ucretleri var mi?" },
  { key: "hasBordroIncentiveConflicts", label: "Ar-Ge/teknokent bordro tesvikleriyle yan haklar cakisiyor mu?" },
  { key: "doesNetBrutPlanning", label: "Net/brut ucret planlamasi yapiliyor mu?" },
  { key: "analyzesPayrollTaxAndSgkEffects", label: "Bordroda gelir vergisi, damga ve SGK etkisi analiz ediliyor mu?" },
];

const section12Questions: BooleanQuestion[] = [
  { key: "hasSeparateAccountingAccounts", label: "Ayri muhasebe hesaplari acildi mi?" },
  { key: "hasProjectCostCenters", label: "Proje bazli maliyet merkezi var mi?" },
  { key: "hasPersonnelTimeRecords", label: "Personel zaman kayitlari var mi?" },
  { key: "hasInvoiceBankContractFiles", label: "Fatura/dekont/sozlesme dosyasi hazir mi?" },
  { key: "hasDeclarationControls", label: "Beyanname kontrolleri yapiliyor mu?" },
  { key: "needsYmmReportGeneral", label: "YMM raporu gerekiyor mu?" },
  { key: "needsBoardOrGeneralAssemblyDecisions", label: "Yonetim kurulu/genel kurul kararlari gerekiyor mu?" },
  { key: "doesPeriodicIncentiveControls", label: "Tesvik ve istisna uygulamalarinda donemsel kontrol yapiliyor mu?" },
  { key: "hasAuthorityPermitsAndLicenses", label: "Kurum onaylari, faaliyet belgeleri ve ruhsatlar hazir mi?" },
];

function renderBooleanQuestions(
  questions: BooleanQuestion[],
  form: VergiselTesvikFormState,
  setBoolean: (key: keyof VergiselTesvikFormState, value: boolean) => void,
) {
  return questions.map((question) => (
    <BinaryField
      key={String(question.key)}
      label={question.label}
      value={Boolean(form[question.key])}
      onChange={(value) => setBoolean(question.key, value)}
    />
  ));
}

export default function VergiselTesvikEligibilityPage() {
  const [selection, setSelection] = useState<VergiselNeedSelection>(createInitialVergiselNeedSelection);
  const [form, setForm] = useState<VergiselTesvikFormState>(createInitialVergiselTesvikFormState);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfoState>(defaultAnalysisInfoState);
  const resultsSectionRef = useRef<HTMLElement | null>(null);

  const results = useMemo(() => evaluateVergiselTesvikSupports(form, selection), [form, selection]);
  const summary = useMemo(() => summarizeVergiselTesvikResults(results, form), [results, form]);

  const groupedResults = useMemo(
    () => ({
      uygun: results.filter((item) => item.status === "UYGUN"),
      potansiyel: results.filter((item) => item.status === "POTANSIYEL"),
      riskli: results.filter((item) => item.status === "UYGUN DEGIL / RISKLI"),
    }),
    [results],
  );

  const updateField = <K extends keyof VergiselTesvikFormState>(key: K, value: VergiselTesvikFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const setBoolean = (key: keyof VergiselTesvikFormState, value: boolean) =>
    updateField(key, value as VergiselTesvikFormState[typeof key]);
  const setString = (key: keyof VergiselTesvikFormState, value: string) =>
    updateField(key, value as VergiselTesvikFormState[typeof key]);

  const toggleNeed = (need: VergiselNeedType) => {
    setSelection((prev) => ({ ...prev, [need]: !prev[need] }));
  };

  const setAllNeeds = () => setSelection(createInitialVergiselNeedSelection());
  const clearAllNeeds = () => setSelection(emptySelection);

  const allNeedsSelected = Object.values(selection).every(Boolean);
  const noNeedSelected = Object.values(selection).every((item) => !item);

  const { clearInfo, isSaving, saveMessage, handleSave, handleReportPlaceholder } = useAnalysisWorkspace({
    analysisType: "vergisel_tesvik",
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
    defaultTitle: "Vergisel teşvik analizi",
  });

  const resetAnalysis = () => {
    setSelection(createInitialVergiselNeedSelection());
    setForm(createInitialVergiselTesvikFormState());
    clearInfo();
  };

  const handleStartAnalysis = () => {
    resultsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-slate-900">Vergisel Tesvikler ve Istisnalar Uygunluk Araci</h1>
        <p className="mt-1 text-sm text-slate-700">
          Mali musavirlik, bagimsiz denetim ve tesvik danismanligi ekipleri icin vergisel tesvik, istisna ve vergi
          avantaji alanlarinda on uygunluk degerlendirme ekrani.
        </p>
      </header>

      <VergiselTesvikSummaryDashboard summary={summary} />

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900">Vergi avantaji ihtiyaci tipi secimi</h2>
        <p className="mt-1 text-sm text-slate-600">Birden fazla ihtiyac tipi secilebilir.</p>
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
          {(Object.keys(needLabels) as VergiselNeedType[]).map((needKey) => (
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

      <VergiselTesvikQuestionSection title="1. Firma ve Mukellef Bilgileri">
        <Field label="Mukellef turu nedir?">
          <select
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
            value={form.mukellefType}
            onChange={(event) => updateField("mukellefType", event.target.value as MukellefType)}
          >
            {mukellefTypes.map((type) => (
              <option key={type} value={type}>
                {mukellefTypeLabels[type]}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Firma kurulus tarihi">
          <input
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.establishmentDate}
            onChange={(event) => setString("establishmentDate", event.target.value)}
          />
        </Field>
        {renderBooleanQuestions(section1Questions, form, setBoolean)}
      </VergiselTesvikQuestionSection>

      {selection.teknokent4691 ? (
        <VergiselTesvikQuestionSection title="2. Teknokent / 4691 Sorulari">
          {renderBooleanQuestions(section2Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.arge5746 ? (
        <VergiselTesvikQuestionSection title="3. Ar-Ge ve Tasarim Merkezi / 5746 Sorulari">
          {renderBooleanQuestions(section3Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.gencGirisimci ? (
        <VergiselTesvikQuestionSection title="4. Genc Girisimci Kazanc Istisnasi Sorulari">
          {renderBooleanQuestions(section4Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.ytbVergiAvantaj ? (
        <VergiselTesvikQuestionSection title="5. Yatirim Tesvik Belgesi Vergi Avantajlari">
          {renderBooleanQuestions(section5Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.serbestBolge ? (
        <VergiselTesvikQuestionSection title="6. Serbest Bolge Vergi Istisnalari">
          {renderBooleanQuestions(section6Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.ihracatHizmetIhracati ? (
        <VergiselTesvikQuestionSection title="7. Ihracat / Hizmet Ihracati Vergi Avantajlari">
          {renderBooleanQuestions(section7Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.vrhib ? (
        <VergiselTesvikQuestionSection title="8. Vergi Resim Harc Istisnasi Belgesi Sorulari">
          {renderBooleanQuestions(section8Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.kdvIstisnaIade ? (
        <VergiselTesvikQuestionSection title="9. KDV Istisnasi ve KDV Iadesi Sorulari">
          {renderBooleanQuestions(section9Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.osb ? (
        <VergiselTesvikQuestionSection title="10. OSB Vergisel Avantajlari">
          {renderBooleanQuestions(section10Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      {selection.bordroOptimizasyon ? (
        <VergiselTesvikQuestionSection title="11. Ucret, Yan Hak ve Bordro Vergi Optimizasyonu">
          {renderBooleanQuestions(section11Questions, form, setBoolean)}
        </VergiselTesvikQuestionSection>
      ) : null}

      <VergiselTesvikQuestionSection title="12. Belge ve Muhasebe Hazirligi">
        {renderBooleanQuestions(section12Questions, form, setBoolean)}
      </VergiselTesvikQuestionSection>

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
          Vergi avantaji tipi secili degil. En az bir baslik secerseniz analiz odagi netlesir.
        </div>
      ) : null}

      <section ref={resultsSectionRef} className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">13. Sonuc ve Oneriler</h2>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-emerald-800">Uygun Vergisel Tesvikler / Istisnalar</h3>
          {groupedResults.uygun.length ? (
            groupedResults.uygun.map((item) => <VergiselTesvikResultCard key={item.id} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Uygun vergisel tesvik bulunamadi.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-amber-800">
            Potansiyel / Ek Belgeyle Incelenecek Vergisel Avantajlar
          </h3>
          {groupedResults.potansiyel.length ? (
            groupedResults.potansiyel.map((item) => <VergiselTesvikResultCard key={item.id} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Potansiyel vergisel avantaj bulunamadi.</p>
          )}
        </div>

        <div className="space-y-3">
          <h3 className="text-lg font-semibold text-rose-800">Uygun Gorunmeyen / Riskli Vergisel Alanlar</h3>
          {groupedResults.riskli.length ? (
            groupedResults.riskli.map((item) => <VergiselTesvikResultCard key={item.id} result={item} />)
          ) : (
            <p className="text-sm text-slate-600">Riskli alan bulunamadi.</p>
          )}
        </div>
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        <p>
          Bu cikti on degerlendirme niteligindedir. Vergisel tesvikler ve istisnalarda nihai uygunluk; guncel kanun,
          teblig, sirkuler, ozelge, GIB uygulamalari, beyanname sistemi, belge/proje/ruhsat durumu, SMMM/YMM
          degerlendirmesi ve vergi dairesi uygulamalariyla dogrulanmalidir. Hatali istisna veya tesvik uygulamasi vergi
          ziyai, gecikme faizi ve ceza riski dogurabilir.
        </p>
      </footer>
    </div>
  );
}





