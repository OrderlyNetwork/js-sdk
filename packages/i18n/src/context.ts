import { createContext, useContext } from "react";
import { LocaleCode } from "./types";

export type Language = {
  localCode: LocaleCode;
  displayName: string;
};

export type LocaleContextState = {
  languages: Language[];
};

export const LocaleContext = createContext<LocaleContextState>({
  languages: [],
});

export const useLocaleContext = () => {
  return useContext(LocaleContext);
};
