import { API } from "@orderly.network/types";
import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useQuery } from "@orderly.network/hooks";
import { defaultStyles } from "./theming/mergeStyles";

export interface DemoContextState {
  symbol: string;
  onSymbolChange: (symbol: API.Symbol) => void;
  onThemeChange: (key: string, value: string) => void;
}

export const DemoContext = createContext({} as DemoContextState);

export const DemoContextProvider = ({ children }) => {
  const [currentSymbol, setCurrentSymbol] = useState<string>();
  const [styleVars, setStyleVars] = useState(defaultStyles);
  const { data: symbols } = useQuery<API.MarketInfo[]>(`/v1/public/futures`, {
    revalidateOnFocus: false,
  });

  const cssVarWrap = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (Array.isArray(symbols)) {
      setCurrentSymbol(symbols[0].symbol);
    }
  }, [symbols]);

  const onSymbolChange = (symbol: API.Symbol) => {
    setCurrentSymbol(symbol.symbol);
  };

  const onThemeChange = (key: string, value: string) => {
    // setStyleVars((prev) => ({ ...prev, [key]: value }));
    cssVarWrap.current?.style.setProperty(key, value);
  };

  if (!currentSymbol) return null;

  return (
    <DemoContext.Provider
      value={{ symbol: currentSymbol, onSymbolChange, onThemeChange }}
    >
      <div ref={cssVarWrap} style={styleVars}>
        {children}
      </div>
    </DemoContext.Provider>
  );
};

export const useDemoContext = () => {
  return useContext(DemoContext);
};
