import { AppModule } from "../../core/module-system/types";
import TicaretEligibilityPage from "../../ticaret/TicaretEligibilityPage";

const ticaretModule: AppModule = {
  key: "ticaret",
  label: "Ticaret Bakanlığı Destekleri",
  order: 50,
  category: "tesvik",
  page: TicaretEligibilityPage,
};

export default ticaretModule;
