"use client";

import { createContext, FC, PropsWithChildren } from "react";
import { useParams } from "next/navigation";
// import { trpc } from "@/utils/trpc";

interface ThemeContextState {
  theme: any;
}

export const ThemeContext = createContext({} as ThemeContextState);

interface ThemeProviderProps {
  theme: any;
}

export const ThemeProvider: FC<PropsWithChildren<ThemeProviderProps>> = ({
  children,
  theme,
}) => {
  return (
    <ThemeContext.Provider value={{ theme }}>{children}</ThemeContext.Provider>
  );
};
