import { AppModule } from "../../core/module-system/types";
import SgkEligibilityPage from "../../sgk/SgkEligibilityPage";

const sgkModule: AppModule = {
  key: "sgk",
  label: "SGK Teşvikleri",
  order: 10,
  category: "tesvik",
  page: SgkEligibilityPage,
};

export default sgkModule;
