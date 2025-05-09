import "./types";

export * from "react-i18next";
export { default as i18next, createInstance } from "i18next";
export { default as i18n } from "./i18n";
export {
  I18nProvider,
  LocaleProvider,
  type I18nProviderProps,
  type LocaleProviderProps,
} from "./provider";
export { useTranslation } from "./useTranslation";
export { useLocaleCode } from "./useLocaleCode";
export * from "./context";
export * from "./types";
export * from "./constant";
export * from "./locale/en";
export * from "./utils";
