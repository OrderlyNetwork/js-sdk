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
  /** Dutch */
  nl = "nl",
  /** Indonesian */
  id = "id",
}

export const defaultLng = LocaleEnum.en;
export const defaultNS = "translation";


export const defaultLanguages: Language[] = [
  { localCode: LocaleEnum.en, displayName: "English" },
  { localCode: LocaleEnum.zh, displayName: "中文" },
  { localCode: LocaleEnum.ja, displayName: "日本語" },
  { localCode: LocaleEnum.es, displayName: "Español" },
  { localCode: LocaleEnum.ko, displayName: "한국어" },
  { localCode: LocaleEnum.vi, displayName: "Tiếng Việt" },
  { localCode: LocaleEnum.de, displayName: "Deutsch" },
  { localCode: LocaleEnum.fr, displayName: "Français" },
  { localCode: LocaleEnum.nl, displayName: "Nederlands" },
  { localCode: LocaleEnum.id, displayName: "Bahasa Indonesia" },
];

export const i18nLocalStorageKey = "orderly_i18nLng";
