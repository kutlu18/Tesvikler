import { AppModule } from "../../core/module-system/types";
import KosgebEligibilityPage from "../../kosgeb/KosgebEligibilityPage";

const kosgebModule: AppModule = {
  key: "kosgeb",
  label: "KOSGEB Destekleri",
  order: 20,
  category: "tesvik",
  page: KosgebEligibilityPage,
};

export default kosgebModule;
