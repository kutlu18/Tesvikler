import { AppModule } from "../../core/module-system/types";
import YatirimTesvikEligibilityPage from "../../yatirimTesvik/YatirimTesvikEligibilityPage";

const yatirimTesvikModule: AppModule = {
  key: "yatirim",
  label: "Yatırım Teşvikleri",
  order: 40,
  category: "tesvik",
  page: YatirimTesvikEligibilityPage,
};

export default yatirimTesvikModule;
