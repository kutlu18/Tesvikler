import { AppModule } from "../../core/module-system/types";
import EximbankEligibilityPage from "../../eximbank/EximbankEligibilityPage";

const eximbankModule: AppModule = {
  key: "eximbank",
  label: "Eximbank ve Finansman Destekleri",
  order: 60,
  category: "tesvik",
  page: EximbankEligibilityPage,
};

export default eximbankModule;
