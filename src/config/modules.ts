import EximbankEligibilityPage from "../eximbank/EximbankEligibilityPage";
import KalkinmaAjansiEligibilityPage from "../kalkinmaAjansi/KalkinmaAjansiEligibilityPage";
import KosgebEligibilityPage from "../kosgeb/KosgebEligibilityPage";
import SgkEligibilityPage from "../sgk/SgkEligibilityPage";
import TicaretEligibilityPage from "../ticaret/TicaretEligibilityPage";
import TubitakEligibilityPage from "../tubitak/TubitakEligibilityPage";
import VergiselTesvikEligibilityPage from "../vergiselTesvik/VergiselTesvikEligibilityPage";
import YatirimTesvikEligibilityPage from "../yatirimTesvik/YatirimTesvikEligibilityPage";

export interface ModuleConfig {
  id: string;
  title: string;
  description: string;
  path: string;
  guestAccess: boolean;
  iconKey: string;
  categoryLabel: string;
  component: () => JSX.Element;
}

export const moduleConfigs: ModuleConfig[] = [
  {
    id: "sgk",
    title: "SGK Teşvikleri",
    description: "Prim, istihdam ve bordro teşviklerini analiz edin.",
    path: "/app/sgk",
    guestAccess: true,
    iconKey: "sgk",
    categoryLabel: "Misafir erişimine açık",
    component: SgkEligibilityPage,
  },
  {
    id: "kosgeb",
    title: "KOSGEB Destekleri",
    description: "KOBİ, girişimcilik, dijitalleşme ve finansman destekleri.",
    path: "/app/kosgeb",
    guestAccess: false,
    iconKey: "kosgeb",
    categoryLabel: "Kayıtlı kullanıcı",
    component: KosgebEligibilityPage,
  },
  {
    id: "tubitak",
    title: "TÜBİTAK Destekleri",
    description: "Ar-Ge, yenilik, TRL ve teknoloji projeleri.",
    path: "/app/tubitak",
    guestAccess: false,
    iconKey: "tubitak",
    categoryLabel: "Kayıtlı kullanıcı",
    component: TubitakEligibilityPage,
  },
  {
    id: "yatirim-tesvik",
    title: "Yatırım Teşvikleri",
    description: "E-TUYS, yatırım belgesi ve destek unsurlarını değerlendirin.",
    path: "/app/yatirim-tesvik",
    guestAccess: false,
    iconKey: "yatirim",
    categoryLabel: "Kayıtlı kullanıcı",
    component: YatirimTesvikEligibilityPage,
  },
  {
    id: "ticaret",
    title: "Ticaret Bakanlığı Destekleri",
    description: "İhracat, e-ihracat ve hizmet ihracatı destekleri.",
    path: "/app/ticaret",
    guestAccess: false,
    iconKey: "ticaret",
    categoryLabel: "Kayıtlı kullanıcı",
    component: TicaretEligibilityPage,
  },
  {
    id: "eximbank",
    title: "Eximbank ve Finansman Destekleri",
    description: "İhracat finansmanı, sigorta ve kredi fırsatları.",
    path: "/app/eximbank",
    guestAccess: false,
    iconKey: "eximbank",
    categoryLabel: "Kayıtlı kullanıcı",
    component: EximbankEligibilityPage,
  },
  {
    id: "kalkinma-ajansi",
    title: "Kalkınma Ajansları Destekleri",
    description: "Bölgesel kalkınma, fizibilite ve yatırım destekleri.",
    path: "/app/kalkinma-ajansi",
    guestAccess: false,
    iconKey: "kalkinma",
    categoryLabel: "Kayıtlı kullanıcı",
    component: KalkinmaAjansiEligibilityPage,
  },
  {
    id: "vergisel-tesvik",
    title: "Vergisel Teşvikler ve İstisnalar",
    description: "Vergi indirimi, istisna ve muafiyet fırsatları.",
    path: "/app/vergisel-tesvik",
    guestAccess: false,
    iconKey: "vergi",
    categoryLabel: "Kayıtlı kullanıcı",
    component: VergiselTesvikEligibilityPage,
  },
];
