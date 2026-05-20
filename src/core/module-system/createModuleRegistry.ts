import { AppModule, ModuleRegistry } from "./types";

const normalizeModules = (modules: AppModule[]): AppModule[] => {
  const keys = new Set<string>();

  return [...modules]
    .sort((a, b) => a.order - b.order)
    .filter((moduleItem) => {
      if (keys.has(moduleItem.key)) {
        return false;
      }

      keys.add(moduleItem.key);
      return true;
    });
};

export const createModuleRegistry = (modules: AppModule[]): ModuleRegistry => {
  const normalizedModules = normalizeModules(modules);

  return {
    modules: normalizedModules,
    getDefaultModuleKey: () => normalizedModules[0]?.key ?? "",
    getModuleByKey: (key: string) => normalizedModules.find((moduleItem) => moduleItem.key === key),
  };
};
