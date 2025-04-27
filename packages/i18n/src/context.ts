import { createContext, useContext } from "react";
import { LocaleCode } from "./types";

export type Language = {
  localCode: LocaleCode;
  displayName: string;
};

export type LocaleContextState = {
  /**
   * custom languages
   */
  languages: Language[];
  /**
   * called before language changed
   */
  onLanguageBeforeChanged: (lang: LocaleCode) => Promise<void>;
  /**
   * called when language changed
   */
  onLanguageChanged: (lang: LocaleCode) => Promise<void>;
};

export const LocaleContext = createContext<LocaleContextState>({
  languages: [],
  onLanguageBeforeChanged: () => Promise.resolve(),
  onLanguageChanged: () => Promise.resolve(),
});

export const useLocaleContext = () => {
  return useContext(LocaleContext);
};
