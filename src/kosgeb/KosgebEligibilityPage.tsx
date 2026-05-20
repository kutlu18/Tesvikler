import { ReactNode, useMemo, useState } from "react";
import { buildInitialWorkspaceState, useAnalysisWorkspace } from "../core/analysis/useAnalysisWorkspace";
import AnalysisActionBar from "../core/components/AnalysisActionBar";
import AnalysisInfoCard from "../core/components/AnalysisInfoCard";
import type { AnalysisInfoState } from "../types/analysis";
import NaceSelector from "../core/components/NaceSelector";
import KosgebQuestionSection from "./components/KosgebQuestionSection";
import KosgebResultCard from "./components/KosgebResultCard";
import KosgebSummaryDashboard from "./components/KosgebSummaryDashboard";
import { evaluateKosgebSupports, summarizeKosgebResults } from "./logic/evaluateKosgebSupports";
import { CompanyType, KosgebFormState, createInitialKosgebFormState } from "./types";

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

interface BinaryFieldProps {
  label: string;
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

const companyTypes: CompanyType[] = ["Sahis", "Limited", "Anonim", "Kooperatif"];

const emptySummary = {
  uygunCount: 0,
  potansiyelCount: 0,
  riskliCount: 0,
  totalOpportunityCount: 0
};

const calculateCompanyAge = (establishmentDate: string): number | null => {
  if (!establishmentDate) {
    return null;
  }

  const establishedAt = new Date(establishmentDate);
  if (Number.isNaN(establishedAt.getTime())) {
    return null;
  }

  const today = new Date();
  let age = today.getFullYear() - establishedAt.getFullYear();
  const monthDiff = today.getMonth() - establishedAt.getMonth();

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < establishedAt.getDate())) {
    age -= 1;
  }

  return Math.max(age, 0);
};

export default function KosgebEligibilityPage() {
  const initialWorkspace = buildInitialWorkspaceState<KosgebFormState>("kosgeb", createInitialKosgebFormState);
  const [form, setForm] = useState<KosgebFormState>(initialWorkspace.form);
  const [analysisInfo, setAnalysisInfo] = useState<AnalysisInfoState>(initialWorkspace.info);
  const [hasAnalysis, setHasAnalysis] = useState(false);

  const results = useMemo(() => evaluateKosgebSupports(form), [form]);
  const summary = useMemo(() => summarizeKosgebResults(results), [results]);

  const grouped = useMemo(
    () => ({
      uygun: results.filter((item) => item.status === "UYGUN"),
      potansiyel: results.filter((item) => item.status.startsWith("POTANS")),
      riskli: results.filter((item) => item.status !== "UYGUN" && !item.status.startsWith("POTANS"))
    }),
    [results]
  );

  const companyAgeYears = useMemo(() => calculateCompanyAge(form.establishmentDate), [form.establishmentDate]);

  const updateField = <K extends keyof KosgebFormState>(key: K, value: KosgebFormState[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const runAnalysis = () => setHasAnalysis(true);

  const setBoolean = (key: keyof KosgebFormState, value: boolean) =>
    updateField(key, value as KosgebFormState[typeof key]);

  const setNumber = (key: keyof KosgebFormState, value: number) =>
    updateField(key, (Number.isNaN(value) ? 0 : value) as KosgebFormState[typeof key]);

  const setString = (key: keyof KosgebFormState, value: string) =>
    updateField(key, value as KosgebFormState[typeof key]);

  const selectZeroValue = (event: React.FocusEvent<HTMLInputElement>) => {
    if (event.target.value === "0") {
      requestAnimationFrame(() => {
        event.target.select();
      });
    }
  };

  const keepZeroSelectedOnMouseUp = (event: React.MouseEvent<HTMLInputElement>) => {
    if (event.currentTarget.value === "0") {
      event.preventDefault();
      event.currentTarget.select();
    }
  };

  const replaceLeadingZeroOnKeyDown =
    (key: keyof KosgebFormState) =>
    (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        event.currentTarget.value === "0" &&
        event.key.length === 1 &&
        /[0-9]/.test(event.key) &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        setNumber(key, Number(event.key));
      }
    };

  const setNullableNumber = (key: keyof KosgebFormState, rawValue: string) => {
    const parsed = rawValue === "" ? null : Number(rawValue);
    updateField(key, (parsed === null || Number.isNaN(parsed) ? null : parsed) as KosgebFormState[typeof key]);
  };

  const { setInfoField, clearInfo, isSaving, saveMessage, handleSave, handleReportPlaceholder } = useAnalysisWorkspace({
    analysisType: "kosgeb",
    info: analysisInfo,
    setInfo: setAnalysisInfo,
    formData: {
      ...form,
      computedCompanyAgeYears: companyAgeYears,
    } as unknown as Record<string, unknown>,
    results: {
      uygun: grouped.uygun as unknown as Array<Record<string, unknown>>,
      potansiyel: grouped.potansiyel as unknown as Array<Record<string, unknown>>,
      riskli: grouped.riskli as unknown as Array<Record<string, unknown>>,
    },
    scores: summary as unknown as Record<string, unknown>,
    defaultTitle: "KOSGEB analizi",
  });

  const visibleSummary = hasAnalysis ? summary : emptySummary;

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-brand-100 bg-white p-5 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">KOSGEB Destek Uygunluk Aracı</h1>
          <p className="mt-1 text-sm text-slate-700">
            Mali müşavirlik ve bağımsız denetim ofisleri için ön uygunluk değerlendirme ekranı.
          </p>
        </div>
      </header>

      <AnalysisInfoCard value={analysisInfo} onChange={setInfoField} />

      <KosgebSummaryDashboard summary={visibleSummary} />

      <KosgebQuestionSection title="1. İşletme Genel Bilgileri">
        <BinaryField label="İşletme KOBİ statüsünde mi?" value={form.isKobi} onChange={(v) => setBoolean("isKobi", v)} />
        <Field label="İşletme türü">
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
        <Field label="İşletme kuruluş tarihi">
          <input
            type="date"
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.establishmentDate}
            onChange={(e) => setString("establishmentDate", e.target.value)}
          />
        </Field>
        <Field label="NACE kodu / faaliyet alani">
          <NaceSelector value={form.naceCode} onChange={(value) => setString("naceCode", value)} />
        </Field>
        <BinaryField label="İşletme imalat sektöründe mi?" value={form.isManufacturing} onChange={(v) => setBoolean("isManufacturing", v)} />
        <BinaryField label="İşletme teknoloji / yazılım / Ar-Ge alanında mı?" value={form.isTechOrArge} onChange={(v) => setBoolean("isTechOrArge", v)} />
        <BinaryField label="İşletme ticaret veya hizmet sektöründe mi?" value={form.isTradeOrService} onChange={(v) => setBoolean("isTradeOrService", v)} />
        <Field label="Çalışan sayısı">
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.employeeCount}
            onChange={(e) => setNumber("employeeCount", Number(e.target.value))}
          />
        </Field>
        <Field label="Yıllık net satış hasılatı (TL)">
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.annualNetSales ?? ""}
            onChange={(e) => setNullableNumber("annualNetSales", e.target.value)}
          />
        </Field>
        <Field label="Mali bilanço büyüklüğü (TL)">
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.balanceSheetSize}
            onFocus={selectZeroValue}
            onMouseUp={keepZeroSelectedOnMouseUp}
            onKeyDown={replaceLeadingZeroOnKeyDown("balanceSheetSize")}
            onChange={(e) => setNumber("balanceSheetSize", Number(e.target.value))}
          />
        </Field>
        <BinaryField label="Vergi / SGK borcu var mı?" value={form.hasTaxOrSgkDebt} onChange={(v) => setBoolean("hasTaxOrSgkDebt", v)} />
        <BinaryField label="KOSGEB veri tabanına kayıtlı mı?" value={form.isKosgebRegistered} onChange={(v) => setBoolean("isKosgebRegistered", v)} />
        <BinaryField label="KOBİ beyannamesi güncel mi?" value={form.isKobiDeclarationCurrent} onChange={(v) => setBoolean("isKobiDeclarationCurrent", v)} />
      </KosgebQuestionSection>

      <KosgebQuestionSection title="2. Girişimci ve Kuruluş Bilgileri">
        <BinaryField label="İşletme yeni kuruldu mu?" value={form.isNewlyEstablished} onChange={(v) => setBoolean("isNewlyEstablished", v)} />
        <BinaryField label="Kurucu KOSGEB girişimcilik eğitimi aldı mı?" value={form.founderHasKosgebTraining} onChange={(v) => setBoolean("founderHasKosgebTraining", v)} />
        <BinaryField label="Kurucu kadın mı?" value={form.founderIsWoman} onChange={(v) => setBoolean("founderIsWoman", v)} />
        <BinaryField label="Kurucu genç girişimci mi?" value={form.founderIsYoung} onChange={(v) => setBoolean("founderIsYoung", v)} />
        <BinaryField
          label="Kurucu engelli, gazi veya şehit yakını mı?"
          value={form.founderIsDisabledVeteranOrMartyrRelative}
          onChange={(v) => setBoolean("founderIsDisabledVeteranOrMartyrRelative", v)}
        />
        <BinaryField label="İşletme son 3 yıl içinde mi kuruldu?" value={form.establishedWithin3Years} onChange={(v) => setBoolean("establishedWithin3Years", v)} />
        <BinaryField
          label="İşletme iş geliştirme yatırımı yapmak istiyor mu?"
          value={form.wantsBusinessDevelopmentInvestment}
          onChange={(v) => setBoolean("wantsBusinessDevelopmentInvestment", v)}
        />
      </KosgebQuestionSection>

      <KosgebQuestionSection title="3. Yatırım ve Harcama Planı">
        <BinaryField label="Makine-teçhizat alınacak mı?" value={form.plansMachineEquipment} onChange={(v) => setBoolean("plansMachineEquipment", v)} />
        <BinaryField label="Yazılım alınacak mı?" value={form.plansSoftware} onChange={(v) => setBoolean("plansSoftware", v)} />
        <BinaryField label="Personel istihdam edilecek mi?" value={form.plansEmployment} onChange={(v) => setBoolean("plansEmployment", v)} />
        <BinaryField label="Eğitim/danışmanlık alınacak mı?" value={form.plansTrainingConsulting} onChange={(v) => setBoolean("plansTrainingConsulting", v)} />
        <BinaryField
          label="Belgelendirme, test veya analiz ihtiyacı var mı?"
          value={form.needsCertificationTestAnalysis}
          onChange={(v) => setBoolean("needsCertificationTestAnalysis", v)}
        />
        <BinaryField label="Tasarım hizmeti alınacak mı?" value={form.plansDesignService} onChange={(v) => setBoolean("plansDesignService", v)} />
        <BinaryField
          label="Sınai mülkiyet / marka / patent harcaması var mı?"
          value={form.plansIndustrialProperty}
          onChange={(v) => setBoolean("plansIndustrialProperty", v)}
        />
        <BinaryField
          label="Pazarlama veya tanıtım harcaması yapılacak mı?"
          value={form.plansMarketingPromotion}
          onChange={(v) => setBoolean("plansMarketingPromotion", v)}
        />
        <BinaryField label="Yurt dışı pazar veya ihracat hedefi var mı?" value={form.hasExportGoal} onChange={(v) => setBoolean("hasExportGoal", v)} />
        <BinaryField
          label="E-ticaret / dijitalleşme yatırımı var mı?"
          value={form.plansDigitalizationInvestment}
          onChange={(v) => setBoolean("plansDigitalizationInvestment", v)}
        />
        <BinaryField
          label="Enerji verimliliği veya yeşil dönüşüm yatırımı var mı?"
          value={form.plansEnergyEfficiencyOrGreenTransformation}
          onChange={(v) => setBoolean("plansEnergyEfficiencyOrGreenTransformation", v)}
        />
        <Field label="Proje bütçesi (TL)">
          <input
            type="number"
            min={0}
            className="w-full rounded-lg border border-slate-300 px-3 py-2"
            value={form.projectBudget}
            onFocus={selectZeroValue}
            onChange={(e) => setNumber("projectBudget", Number(e.target.value))}
          />
        </Field>
      </KosgebQuestionSection>

      <KosgebQuestionSection title="4. Ar-Ge, Ürün Geliştirme ve Teknoloji">
        <BinaryField label="Yeni ürün geliştiriliyor mu?" value={form.developsNewProduct} onChange={(v) => setBoolean("developsNewProduct", v)} />
        <BinaryField label="Mevcut üründe teknolojik iyileştirme yapılacak mı?" value={form.plansTechnologicalImprovement} onChange={(v) => setBoolean("plansTechnologicalImprovement", v)} />
        <BinaryField label="Prototip veya MVP geliştirilecek mi?" value={form.plansPrototypeOrMvp} onChange={(v) => setBoolean("plansPrototypeOrMvp", v)} />
        <BinaryField
          label="Üniversite / teknokent / Ar-Ge merkezi bağlantısı var mı?"
          value={form.hasUniversityTechnoparkRAndDLink}
          onChange={(v) => setBoolean("hasUniversityTechnoparkRAndDLink", v)}
        />
        <BinaryField
          label="Patentlenebilir veya ticarileştirilebilir teknoloji var mı?"
          value={form.hasPatentableTechnology}
          onChange={(v) => setBoolean("hasPatentableTechnology", v)}
        />
        <BinaryField label="Ürün seri üretime geçecek mi?" value={form.plansMassProduction} onChange={(v) => setBoolean("plansMassProduction", v)} />
        <BinaryField
          label="Ürün yerli üretim veya ithal ikamesi niteliğinde mi?"
          value={form.hasDomesticProductionOrImportSubstitutionFocus}
          onChange={(v) => setBoolean("hasDomesticProductionOrImportSubstitutionFocus", v)}
        />
      </KosgebQuestionSection>

      <KosgebQuestionSection title="5. Enerji, Yeşil Dönüşüm ve Verimlilik">
        <BinaryField label="İşletmenin enerji tüketimi yüksek mi?" value={form.hasHighEnergyConsumption} onChange={(v) => setBoolean("hasHighEnergyConsumption", v)} />
        <BinaryField label="Enerji etüdü yaptırıldı mı?" value={form.hasEnergyAudit} onChange={(v) => setBoolean("hasEnergyAudit", v)} />
        <BinaryField label="Motor değişimi veya verimli motor yatırımı yapılacak mı?" value={form.plansEfficientMotorInvestment} onChange={(v) => setBoolean("plansEfficientMotorInvestment", v)} />
        <BinaryField label="Karbon emisyonu azaltımı hedefleniyor mu?" value={form.targetsCarbonReduction} onChange={(v) => setBoolean("targetsCarbonReduction", v)} />
        <BinaryField
          label="GES, enerji verimliliği veya sürdürülebilirlik yatırımı planlanıyor mu?"
          value={form.plansGesOrSustainabilityInvestment}
          onChange={(v) => setBoolean("plansGesOrSustainabilityInvestment", v)}
        />
        <BinaryField label="AB Yeşil Mutabakatı / CBAM riski var mı?" value={form.hasGreenDealOrCbamRisk} onChange={(v) => setBoolean("hasGreenDealOrCbamRisk", v)} />
      </KosgebQuestionSection>

      <KosgebQuestionSection title="6. Finansman ve Kredi İhtiyacı">
        <BinaryField label="İşletme kredi kullanmak istiyor mu?" value={form.needsCredit} onChange={(v) => setBoolean("needsCredit", v)} />
        <BinaryField label="İşletme sermayesi ihtiyacı var mı?" value={form.needsWorkingCapital} onChange={(v) => setBoolean("needsWorkingCapital", v)} />
        <BinaryField label="Yatırım kredisi ihtiyacı var mı?" value={form.needsInvestmentLoan} onChange={(v) => setBoolean("needsInvestmentLoan", v)} />
        <BinaryField label="Faiz / kâr payı desteği arıyor mu?" value={form.seeksInterestOrProfitShareSupport} onChange={(v) => setBoolean("seeksInterestOrProfitShareSupport", v)} />
        <BinaryField label="Teminat sorunu var mı?" value={form.hasCollateralProblem} onChange={(v) => setBoolean("hasCollateralProblem", v)} />
      </KosgebQuestionSection>
      <AnalysisActionBar
        onStart={runAnalysis}
        onSave={handleSave}
        onReset={() => {
          setForm(createInitialKosgebFormState());
          clearInfo();
          setHasAnalysis(false);
        }}
        onReportPlaceholder={handleReportPlaceholder}
        isSaving={isSaving}
        saveMessage={saveMessage}
      />

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">7. Sonuç ve Öneriler</h2>

        {!hasAnalysis ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
            Analiz sonuçlarının görünmesi için formu doldurup "Yeni KOSGEB analizi başlat" butonuna tıklayın.
          </div>
        ) : (
          <>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-emerald-800">Uygun Destekler</h3>
              {grouped.uygun.length ? grouped.uygun.map((item) => <KosgebResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Uygun destek bulunamadı.</p>}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-amber-800">Potansiyel / Ek Belgeyle İncelenecek Destekler</h3>
              {grouped.potansiyel.length ? grouped.potansiyel.map((item) => <KosgebResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Potansiyel destek bulunamadı.</p>}
            </div>

            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-rose-800">Uygun Görünmeyen / Riskli Destekler</h3>
              {grouped.riskli.length ? grouped.riskli.map((item) => <KosgebResultCard key={item.id} result={item} />) : <p className="text-sm text-slate-600">Riskli destek bulunamadı.</p>}
            </div>
          </>
        )}
      </section>

      <footer className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm">
        Bu çıktı ön değerlendirme niteliğindedir. KOSGEB desteklerinde nihai uygunluk; güncel program uygulama esasları,
        açık çağrı şartları, NACE kodu, KOBİ beyannamesi, borç durumu ve KOSGEB başvuru ekranındaki kontrollerle
        doğrulanmalıdır.
      </footer>
    </div>
  );
}







