import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
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

export const DemoContextProvider: React.FC<React.PropsWithChildren> = (
  props,
) => {
  const { children } = props;
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

  const onSymbolChange = useCallback(
    (symbol: API.Symbol) => {
      setCurrentSymbol(symbol.symbol);
    },
    [setCurrentSymbol],
  );

  const onPreviewModeChange = useCallback(
    (mode: EditorViewMode) => {
      setViewMode(mode);
    },
    [setViewMode],
  );

  const onThemeChange = useCallback(
    (key: string, value: string) => {
      setTheme((prev) => ({ ...prev, [key]: value }));
      const event = new CustomEvent("theme-changed", {
        detail: { key, value },
      });
      // window.document.body.dispatchEvent(event);
      cssVarWrap.current?.dispatchEvent(event);
    },
    [setTheme, cssVarWrap],
  );

  const clearStorageTheme = useCallback(() => {
    // removeStorage("THEME_DOCUMENT");
    setTheme(defaultStyles);
  }, [setTheme]);

  const resetTheme = useCallback(() => {
    // removeStorage("THEME_DOCUMENT");
    setTheme(defaultStyles);
  }, [setTheme]);

  const memoizedValue = useMemo<DemoContextState>(() => {
    return {
      symbol: currentSymbol!,
      theme,
      onSymbolChange,
      onThemeChange,
      viewMode,
      clearStorageTheme,
      resetTheme,
      onViewModeChange: onPreviewModeChange,
    };
  }, [
    currentSymbol,
    theme,
    viewMode,
    onSymbolChange,
    onThemeChange,
    clearStorageTheme,
    resetTheme,
    onPreviewModeChange,
  ]);

  if (!currentSymbol) {
    return null;
  }

  return (
    <DemoContext.Provider value={memoizedValue}>
      <div ref={cssVarWrap} id="theme-root-el">
        {children}
      </div>
    </DemoContext.Provider>
  );
};

export const useDemoContext = () => {
  return useContext(DemoContext);
};
