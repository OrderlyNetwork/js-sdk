import { createContext, useContext, useEffect, useRef, useState } from "react";
import { API } from "@orderly.network/types";
import {
  useQuery,
  useLocalStorage,
  useSessionStorage,
} from "@orderly.network/hooks";
import { defaultStyles } from "./theming/mergeStyles";

export enum EditorViewMode {
  Component,
  Mobile,
  Desktop,
}

export interface DemoContextState {
  symbol: string;
  viewMode: EditorViewMode;
  onViewModeChange: (mode: EditorViewMode) => void;
  onSymbolChange: (symbol: API.Symbol) => void;
  onThemeChange: (key: string, value: string) => void;
}

export const DemoContext = createContext({} as DemoContextState);

export const DemoContextProvider = ({ children }) => {
  const [currentSymbol, setCurrentSymbol] = useState<string>();
  const [viewMode, setViewMode] = useState(EditorViewMode.Component);

  const { data: symbols } = useQuery<API.MarketInfo[]>(`/v1/public/futures`, {
    revalidateOnFocus: false,
  });

  const [styleVars, setStyleVars] = useSessionStorage<any>(
    "THEME_DOCUMENT",
    defaultStyles
  );

  const cssVarWrap = useRef<HTMLDivElement | null>(null);

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
    setStyleVars((prev) => ({ ...prev, [key]: value }));
  };

  if (!currentSymbol) return null;

  return (
    <DemoContext.Provider
      value={{
        symbol: currentSymbol,
        onSymbolChange,
        onThemeChange,
        viewMode,
        onViewModeChange: onPreviewModeChange,
      }}
    >
      <div ref={cssVarWrap} style={styleVars} id="theme-root-el">
        {children}
      </div>
    </DemoContext.Provider>
  );
};

export const useDemoContext = () => {
  return useContext(DemoContext);
};
