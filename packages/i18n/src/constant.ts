import { Language } from "./context";

export enum LocaleEnum {
  /** English */
  en = "en",
  /** Chinese */
  zh = "zh",
  /** Japanese */
  ja = "ja",
  /** Spanish */
  es = "es",
  /** Korean */
  ko = "ko",
  /** Vietnamese */
  vi = "vi",
  /** German */
  de = "de",
  /** French */
  fr = "fr",
  /** Russian */
  ru = "ru",
  /** Indonesian */
  id = "id",
  /** Turkish */
  tr = "tr",
  /** Italian */
  it = "it",
  /** Portuguese */
  pt = "pt",
  /** Ukrainian */
  uk = "uk",
  /** Polish */
  pl = "pl",
  /** Dutch */
  nl = "nl",
}

export const defaultLanguages: Language[] = [
  { localCode: LocaleEnum.en, displayName: "English" }, // English
  { localCode: LocaleEnum.zh, displayName: "中文" }, // Chinese
  { localCode: LocaleEnum.ja, displayName: "日本語" }, // Japanese
  { localCode: LocaleEnum.es, displayName: "Español" }, // Spanish
  { localCode: LocaleEnum.ko, displayName: "한국어" }, // Korean
  { localCode: LocaleEnum.vi, displayName: "Tiếng Việt" }, // Vietnamese
  { localCode: LocaleEnum.de, displayName: "Deutsch" }, // German
  { localCode: LocaleEnum.fr, displayName: "Français" }, // French
  { localCode: LocaleEnum.ru, displayName: "Русский" }, // Russian
  { localCode: LocaleEnum.id, displayName: "Bahasa Indonesia" }, // Indonesian
  { localCode: LocaleEnum.tr, displayName: "Türkçe" }, // Turkish
  { localCode: LocaleEnum.it, displayName: "Italiano" }, // Italian
  { localCode: LocaleEnum.pt, displayName: "Português" }, // Portuguese
  { localCode: LocaleEnum.uk, displayName: "Українська" }, // Ukrainian
  { localCode: LocaleEnum.pl, displayName: "Polski" }, // Polish
  { localCode: LocaleEnum.nl, displayName: "Nederlands" }, // Dutch
];
export const defaultLng = LocaleEnum.en;
export const defaultNS = "translation";

export const i18nLocalStorageKey = "orderly_i18nLng";

// preferred-language
export const i18nCookieKey = "orderly_i18nLng";
