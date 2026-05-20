export type AnalysisType =
  | "sgk"
  | "kosgeb"
  | "tubitak"
  | "yatirim_tesvik"
  | "ticaret"
  | "tarim"
  | "eximbank"
  | "kalkinma_ajansi"
  | "vergisel_tesvik";

export type AnalysisStatus = "Taslak" | "Tamamlandi" | "Raporlandi" | "Arsivlendi";

export interface AnalysisInfoState {
  analysisId: string | null;
  title: string;
  customerName: string;
  customerTaxNumber: string;
  customerNaceCode: string;
  customerSector: string;
  notes: string;
  status: AnalysisStatus;
}

export interface PersistedAnalysisResults {
  uygun: Array<Record<string, unknown>>;
  potansiyel: Array<Record<string, unknown>>;
  riskli: Array<Record<string, unknown>>;
}

export interface SaveAnalysisInput {
  analysisId?: string | null;
  userId?: string | null;
  analysisType: AnalysisType;
  title: string;
  customerName?: string;
  customerTaxNumber?: string;
  customerNaceCode?: string;
  customerSector?: string;
  formData: Record<string, unknown>;
  extractedCategories?: Record<string, unknown> | null;
  results: PersistedAnalysisResults;
  scores?: Record<string, unknown> | null;
  eligibleCount: number;
  potentialCount: number;
  riskyCount: number;
  notes?: string;
  status: AnalysisStatus;
}

export interface AnalysisRecord extends SaveAnalysisInput {
  id: string;
  userId: string | null;
  createdAt: string;
  updatedAt: string;
  archivedAt: string | null;
  isGuest?: boolean;
}

export interface AnalysisNoteRecord {
  id: string;
  analysisId: string;
  userId: string;
  note: string;
  createdAt: string;
  updatedAt: string;
}

export interface AnalysisFilters {
  analysisType?: AnalysisType | "all";
  search?: string;
  status?: AnalysisStatus | "all";
  customerName?: string;
  naceCode?: string;
  dateFrom?: string;
  dateTo?: string;
  resultBucket?: "uygun" | "potansiyel" | "riskli" | "all";
}

export const analysisTypeLabels: Record<AnalysisType, string> = {
  sgk: "SGK Tesvikleri",
  kosgeb: "KOSGEB Destekleri",
  tubitak: "TUBITAK Destekleri",
  yatirim_tesvik: "Yatirim Tesvikleri",
  ticaret: "Ticaret Bakanligi Destekleri",
  tarim: "Tarim Destekleri",
  eximbank: "Eximbank ve Finansman Destekleri",
  kalkinma_ajansi: "Kalkinma Ajanslari Destekleri",
  vergisel_tesvik: "Vergisel Tesvikler ve Istisnalar",
};

export const defaultAnalysisInfoState = (): AnalysisInfoState => ({
  analysisId: null,
  title: "",
  customerName: "",
  customerTaxNumber: "",
  customerNaceCode: "",
  customerSector: "",
  notes: "",
  status: "Taslak",
});
