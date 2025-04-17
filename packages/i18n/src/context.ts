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
   * called when language changed
   */
  onLanguageChanged: (lang: LocaleCode) => Promise<void>;
  /**
   * called before language changed
   */
  onLanguageBeforeChanged: (lang: LocaleCode) => Promise<void>;
};

export const LocaleContext = createContext<LocaleContextState>({
  languages: [],
  onLanguageChanged: () => Promise.resolve(),
  onLanguageBeforeChanged: () => Promise.resolve(),
});

export const useLocaleContext = () => {
  return useContext(LocaleContext);
};
