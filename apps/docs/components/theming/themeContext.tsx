"use client";

import React, { createContext, useMemo } from "react";

interface ThemeContextState {
  theme: any;
}

export const ThemeContext = createContext({} as ThemeContextState);

interface ThemeProviderProps {
  theme: any;
}

export const ThemeProvider: React.FC<
  React.PropsWithChildren<ThemeProviderProps>
> = (props) => {
  const { children, theme } = props;
  const memoizedValue = useMemo<ThemeContextState>(() => ({ theme }), [theme]);
  return (
    <ThemeContext.Provider value={memoizedValue}>
      {children}
    </ThemeContext.Provider>
  );
};
