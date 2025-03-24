import "./types";
export * from "react-i18next";
export { default as i18next, createInstance } from "i18next";
export { default as i18n } from "./i18n";
export {
  I18nProvider,
  LocaleProvider,
  type I18nProviderProps,
  type LocaleProviderProps,
  type Resources,
} from "./provider";
export { useTranslation } from "./useTranslation";
export type { LocaleMessages } from "./resources";
export { en } from "./locale/en";
export { type LocaleCode, LocaleEnum } from "./localization";
export { useLocaleCode } from "./useLocaleCode";
export type { Language } from "./context";
export { useLocaleContext } from "./context";
