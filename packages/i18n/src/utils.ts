import { LocaleEnum } from "./constant";
import { LocaleCode } from "./types";

/**
 * transform browser language to you given i18n locale code
 * @example
 * parseI18nLang('en-US') => 'en'
 * parseI18nLang('zh-CN') => 'zh'
 * parseI18nLang('zh-TW') => 'zh'
 * parseI18nLang('ja') => 'ja'
 * */
export function parseI18nLang(
  lang: string,
  localeCodes?: LocaleCode[],
  defaultLang?: LocaleCode
) {
  console.log("Browser language", lang);
  localeCodes = localeCodes || Object.values(LocaleEnum);
  defaultLang = defaultLang || LocaleEnum.en;

  const regex = /^([a-z]{2})/i;
  const match = lang.match(regex);

  if (!match) return defaultLang;

  const matchLang = match[1];

  if (localeCodes.includes(lang)) {
    return lang;
  }

  if (localeCodes.includes(matchLang)) {
    return matchLang;
  }

  return defaultLang;
}
