import { AppModule } from "../../core/module-system/types";
import TubitakEligibilityPage from "../../tubitak/TubitakEligibilityPage";

const tubitakModule: AppModule = {
  key: "tubitak",
  label: "TÜBİTAK Destekleri",
  order: 30,
  category: "tesvik",
  page: TubitakEligibilityPage,
};

export default tubitakModule;
