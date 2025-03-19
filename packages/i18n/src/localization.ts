export enum LocaleEnum {
  /** English */
  en = "en",
  /** Traditional Chinese */
  "zh-TW" = "zh-TW",
  /** Simplified Chinese */
  "zh-Hans" = "zh-Hans",
  /** Turkish */
  tr = "tr",
  /** Russian */
  ru = "ru",
  /** Portuguese */
  "pt-BR" = "pt-BR",
  /** Ukrainian */
  "uk-UA" = "uk-UA",
  /** Vietnamese */
  "vi-VN" = "vi-VN",
  /** Spanish */
  "es-ES" = "es-ES",
}
export type LocaleCode = keyof typeof LocaleEnum | (string & {});
