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

export type LocaleCode = keyof typeof LocaleEnum | (string & {});
