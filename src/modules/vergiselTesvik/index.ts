import { AppModule } from "../../core/module-system/types";
import VergiselTesvikEligibilityPage from "../../vergiselTesvik/VergiselTesvikEligibilityPage";

const vergiselTesvikModule: AppModule = {
  key: "vergiselTesvik",
  label: "Vergisel Tesvikler ve Istisnalar",
  order: 80,
  category: "tesvik",
  page: VergiselTesvikEligibilityPage,
};

export default vergiselTesvikModule;
