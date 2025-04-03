import { createContext } from "react";
import { localeValues } from "./en";

export type Locale = typeof localeValues;

export const LocaleContext = createContext<Locale | undefined>(undefined);
