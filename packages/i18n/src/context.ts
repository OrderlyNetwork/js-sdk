import { createContext, useContext } from "react";
import { LocaleCode, LocaleEnum } from "./localization";

export type Language = {
  localCode: LocaleCode;
  displayName: string;
};

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

export type LocaleContextState = {
  languages: Language[];
};

export const LocaleContext = createContext<LocaleContextState>({
  languages: defaultLanguages,
});

export const useLocaleContext = () => {
  return useContext(LocaleContext);
};
