import { ComponentType } from "react";

export type ModuleCategory = "tesvik";

export interface AppModule {
  key: string;
  label: string;
  order: number;
  category: ModuleCategory;
  page: ComponentType;
}

export interface ModuleRegistry {
  modules: AppModule[];
  getDefaultModuleKey: () => string;
  getModuleByKey: (key: string) => AppModule | undefined;
}
