import { LocaleEnum } from "../constant";
import { Resources } from "../types";
import { en } from "./en";
import zh from "./zh.json";

export { default as zh } from "./zh.json";
export { en } from "./en";

export const allResources: Resources = {
  [LocaleEnum.en]: en,
  [LocaleEnum.zh]: zh,
};
