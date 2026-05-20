import { AppModule } from "../../core/module-system/types";
import KalkinmaAjansiEligibilityPage from "../../kalkinmaAjansi/KalkinmaAjansiEligibilityPage";

const kalkinmaAjansiModule: AppModule = {
  key: "kalkinmaAjansi",
  label: "Kalkinma Ajanslari Destekleri",
  order: 70,
  category: "tesvik",
  page: KalkinmaAjansiEligibilityPage,
};

export default kalkinmaAjansiModule;
