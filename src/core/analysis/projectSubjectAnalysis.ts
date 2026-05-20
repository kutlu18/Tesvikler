export type ProjectSubjectCategory =
  | "ai"
  | "softwareSaasPlatform"
  | "medtechHealth"
  | "machineryProductionAutomation"
  | "greenTransformationEnergy"
  | "agriFoodLivestock"
  | "exportEexportMarketplace"
  | "patentInventionTechTransfer"
  | "universityCollaboration"
  | "customerOrderPilotCustomer"
  | "standardPurchaseInstallation"
  | "serviceExport";

export interface ProjectSubjectAnalysis {
  rawText: string;
  normalizedText: string;
  categories: ProjectSubjectCategory[];
  matchedKeywords: Partial<Record<ProjectSubjectCategory, string[]>>;
}

type CategoryDefinition = {
  id: ProjectSubjectCategory;
  keywords: string[];
};

export const sharedProjectSubjectStorageKey = "sharedProjectSubject";

export const projectSubjectCategoryLabels: Record<ProjectSubjectCategory, string> = {
  ai: "AI / Yapay Zeka",
  softwareSaasPlatform: "Yazilim / SaaS / Platform",
  medtechHealth: "Medikal Teknoloji / Saglik",
  machineryProductionAutomation: "Makine / Uretim / Otomasyon",
  greenTransformationEnergy: "Yesil Donusum / Enerji Verimliligi",
  agriFoodLivestock: "Tarim / Gida / Hayvancilik",
  exportEexportMarketplace: "Ihracat / E-Ihracat / Pazaryeri",
  patentInventionTechTransfer: "Patent / Bulus / Teknoloji Transferi",
  universityCollaboration: "Universite Is Birligi",
  customerOrderPilotCustomer: "Musteri Siparisi / Pilot Musteri",
  standardPurchaseInstallation: "Sadece Satin Alma / Standart Kurulum",
  serviceExport: "Hizmet Ihracati",
};

const categoryDefinitions: CategoryDefinition[] = [
  {
    id: "ai",
    keywords: [
      "yapay zeka",
      "ai",
      "artificial intelligence",
      "makine ogrenmesi",
      "machine learning",
      "derin ogrenme",
      "deep learning",
      "goruntu isleme",
      "computer vision",
      "nlp",
      "llm",
      "buyuk dil modeli",
    ],
  },
  {
    id: "softwareSaasPlatform",
    keywords: [
      "yazilim",
      "software",
      "saas",
      "platform",
      "uygulama",
      "mobil uygulama",
      "web uygulama",
      "erp",
      "crm",
      "mrp",
      "bulut",
      "cloud",
      "api",
      "otomasyon yazilimi",
    ],
  },
  {
    id: "medtechHealth",
    keywords: [
      "medikal",
      "saglik",
      "health",
      "medical",
      "diagnostik",
      "tani kiti",
      "tibbi cihaz",
      "biyomedikal",
      "hastane",
      "klinik",
      "tele tip",
      "tele saglik",
    ],
  },
  {
    id: "machineryProductionAutomation",
    keywords: [
      "makine",
      "uretim",
      "imalat",
      "otomasyon",
      "robotik",
      "hat kurulumu",
      "uretim hatti",
      "endustriyel",
      "tesis",
      "ekipman",
      "kalip",
      "cnc",
    ],
  },
  {
    id: "greenTransformationEnergy",
    keywords: [
      "yesil donusum",
      "enerji verimliligi",
      "karbon",
      "cbam",
      "ges",
      "gunes enerjisi",
      "surdurulebilirlik",
      "atik",
      "geri donusum",
      "kaynak verimliligi",
      "yenilenebilir enerji",
      "yesil uretim",
    ],
  },
  {
    id: "agriFoodLivestock",
    keywords: [
      "tarim",
      "gida",
      "hayvancilik",
      "sera",
      "ziraat",
      "sulama",
      "yem",
      "sut",
      "et",
      "meyve",
      "sebze",
      "tohum",
      "bitkisel",
      "tarimsal",
    ],
  },
  {
    id: "exportEexportMarketplace",
    keywords: [
      "ihracat",
      "e ihracat",
      "eihracat",
      "e-ihracat",
      "mikro ihracat",
      "pazaryeri",
      "marketplace",
      "amazon",
      "etsy",
      "ebay",
      "yurt disi satis",
      "yurt disi pazar",
      "cross border",
    ],
  },
  {
    id: "patentInventionTechTransfer",
    keywords: [
      "patent",
      "faydali model",
      "bulus",
      "teknoloji transferi",
      "lisanslama",
      "know how",
      "fikri hak",
      "fikri mulkiyet",
      "ip transfer",
    ],
  },
  {
    id: "universityCollaboration",
    keywords: [
      "universite",
      "akademik",
      "laboratuvar is birligi",
      "sanayi universite",
      "teknoloji transfer ofisi",
      "tto",
      "akademisyen",
      "arastirma merkezi",
    ],
  },
  {
    id: "customerOrderPilotCustomer",
    keywords: [
      "musteri siparisi",
      "siparis",
      "pilot musteri",
      "on siparis",
      "purchase order",
      "po",
      "pilot uygulama",
      "niyet mektubu",
      "kurumsal musteri",
    ],
  },
  {
    id: "standardPurchaseInstallation",
    keywords: [
      "satin alma",
      "standart kurulum",
      "hazir sistem",
      "bayi alimi",
      "lisans satin alma",
      "mevcut urun alimi",
      "kurulum",
      "entegrasyon kurulumu",
      "raf urunu",
      "off the shelf",
    ],
  },
  {
    id: "serviceExport",
    keywords: [
      "hizmet ihracati",
      "yazilim ihracati",
      "danismanlik ihracati",
      "saglik turizmi",
      "egitim ihracati",
      "muhendislik hizmeti",
      "teknik musavirlik",
      "lojistik hizmeti",
      "yurt disi musteriye hizmet",
      "doviz kazandirici hizmet",
    ],
  },
];

const repairMojibake = (value: string): string =>
  value
    .replace(/\u00C3\u00A7/g, "ç")
    .replace(/\u00C4\u0178/g, "ğ")
    .replace(/\u00C4\u00B1/g, "ı")
    .replace(/\u00C4\u00B0/g, "İ")
    .replace(/\u00C3\u00B6/g, "ö")
    .replace(/\u00C3\u00BC/g, "ü")
    .replace(/\u00C5\u0178/g, "ş")
    .replace(/\u00C5\u017D/g, "Ş")
    .replace(/\u00C3\u2021/g, "Ç")
    .replace(/\u00C3\u2013/g, "Ö")
    .replace(/\u00C3\u0153/g, "Ü");

export const normalizeProjectSubjectText = (value: string): string =>
  repairMojibake(value)
    .trim()
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

export const analyzeProjectSubject = (rawText: string): ProjectSubjectAnalysis => {
  const normalizedText = normalizeProjectSubjectText(rawText);
  const matchedKeywords: Partial<Record<ProjectSubjectCategory, string[]>> = {};
  const categories: ProjectSubjectCategory[] = [];

  for (const definition of categoryDefinitions) {
    const hits = definition.keywords
      .map((keyword) => normalizeProjectSubjectText(keyword))
      .filter((keyword) => keyword.length > 0 && normalizedText.includes(keyword));

    if (hits.length > 0) {
      categories.push(definition.id);
      matchedKeywords[definition.id] = hits;
    }
  }

  return {
    rawText,
    normalizedText,
    categories,
    matchedKeywords,
  };
};

export const mergeProjectSubjectAnalyses = (...texts: string[]): ProjectSubjectAnalysis => {
  const parts = texts.map((text) => text.trim()).filter(Boolean);
  const analysis = analyzeProjectSubject(parts.join(" "));

  return {
    ...analysis,
    rawText: parts.join(" | "),
  };
};

export const hasProjectSubjectCategory = (
  analysis: ProjectSubjectAnalysis,
  category: ProjectSubjectCategory,
): boolean => analysis.categories.includes(category);

export const getStoredSharedProjectSubject = (): string => {
  if (typeof window === "undefined") {
    return "";
  }

  try {
    return window.localStorage.getItem(sharedProjectSubjectStorageKey) ?? "";
  } catch {
    return "";
  }
};

export const getStoredProjectSubjectAnalysis = (): ProjectSubjectAnalysis =>
  analyzeProjectSubject(getStoredSharedProjectSubject());

export const setStoredSharedProjectSubject = (value: string): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    const trimmed = value.trim();
    if (!trimmed) {
      window.localStorage.removeItem(sharedProjectSubjectStorageKey);
      return;
    }

    window.localStorage.setItem(sharedProjectSubjectStorageKey, value);
  } catch {
    // no-op
  }
};

export const clearStoredSharedProjectSubject = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.removeItem(sharedProjectSubjectStorageKey);
  } catch {
    // no-op
  }
};
