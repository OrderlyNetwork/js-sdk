import { createContext, useContext, useEffect, useRef, useState } from "react";
import {
  useQuery,
  useLocalStorage,
  useSessionStorage,
} from "@orderly.network/hooks";
import type { API } from "@orderly.network/types";
import defaultStyles, { getDefaultColors } from "./theming/mergeStyles";

// import { setStorage, removeStorage } from "@/helper/storage";

export enum EditorViewMode {
  Component,
  Mobile,
  Desktop,
}

export interface DemoContextState {
  symbol: string;
  viewMode: EditorViewMode;
  theme: any;
  // cssVars: any;
  clearStorageTheme: () => void;
  resetTheme: () => void;
  onViewModeChange: (mode: EditorViewMode) => void;
  onSymbolChange: (symbol: API.Symbol) => void;
  onThemeChange: (key: string, value: string) => void;
}

export const DemoContext = createContext({} as DemoContextState);

export const DemoContextProvider = ({ children }) => {
  const [currentSymbol, setCurrentSymbol] = useState<string>();
  const [viewMode, setViewMode] = useState(EditorViewMode.Component);
  // const [colors, setColors] = useState<any>(defaultStyles);
  const [theme, setTheme] = useSessionStorage<any>(
    "THEME_DOCUMENT",
    defaultStyles,
  );

  const { data: symbols } = useQuery<API.MarketInfo[]>(`/v1/public/futures`, {
    revalidateOnFocus: false,
  });

  // const [styleVars, setStyleVars] = useSessionStorage<any>(
  //   "THEME_DOCUMENT",
  //   defaultStyles
  // );

  const cssVarWrap = useRef<HTMLDivElement | null>(null);
  // const colors = getDefaultColors();

  // useEffect(() => {
  //   setColors(getDefaultColors());
  // }, []);

  useEffect(() => {
    if (Array.isArray(symbols)) {
      setCurrentSymbol(symbols[0].symbol);
    }
  }, [symbols]);

  const onSymbolChange = (symbol: API.Symbol) => {
    setCurrentSymbol(symbol.symbol);
  };

  const onPreviewModeChange = (mode: EditorViewMode) => {
    setViewMode(mode);
  };

  const onThemeChange = (key: string, value: string) => {
    // setStyleVars((prev) => ({ ...prev, [key]: value }));
    // console.log("setStyleVars", key, value);
    // cssVarWrap.current?.style.setProperty(key, value);
    // setStyleVars((prev) => ({ ...prev, [key]: value }));
    // sessionStorage.setItem("THEME_DOCUMENT", JSON.stringify({ [key]: value }));
    // setStorage("THEME_DOCUMENT", { [key]: value });

    setTheme((prev) => ({ ...prev, [key]: value }));

    const event = new CustomEvent("theme-changed", {
      detail: { key, value },
    });

    // window.document.body.dispatchEvent(event);
    cssVarWrap.current?.dispatchEvent(event);
  };

  const clearStorageTheme = () => {
    // removeStorage("THEME_DOCUMENT");
    setTheme(defaultStyles);
  };

  const resetTheme = () => {
    // removeStorage("THEME_DOCUMENT");
    setTheme(defaultStyles);
  };

  if (!currentSymbol) return null;

  return (
    <DemoContext.Provider
      value={{
        symbol: currentSymbol,
        theme,
        onSymbolChange,
        onThemeChange,
        viewMode,
        clearStorageTheme,
        resetTheme,
        // cssVars:styleVars,
        onViewModeChange: onPreviewModeChange,
      }}
    >
      <div ref={cssVarWrap} id="theme-root-el">
        {children}
      </div>
    </DemoContext.Provider>
  );
};

export const useDemoContext = () => {
  return useContext(DemoContext);
};
