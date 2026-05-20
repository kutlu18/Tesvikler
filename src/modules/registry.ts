import { createModuleRegistry } from "../core/module-system/createModuleRegistry";
import sgkModule from "./sgk";
import kosgebModule from "./kosgeb";
import tubitakModule from "./tubitak";
import yatirimTesvikModule from "./yatirimTesvik";
import ticaretModule from "./ticaret";
import eximbankModule from "./eximbank";
import kalkinmaAjansiModule from "./kalkinmaAjansi";
import vergiselTesvikModule from "./vergiselTesvik";

export const moduleRegistry = createModuleRegistry([
  sgkModule,
  kosgebModule,
  tubitakModule,
  yatirimTesvikModule,
  ticaretModule,
  eximbankModule,
  kalkinmaAjansiModule,
  vergiselTesvikModule,
]);
