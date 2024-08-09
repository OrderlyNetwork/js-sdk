import { API } from "@orderly.network/types";
import React, { PropsWithChildren, ReactNode, useContext } from "react";
import { TradingFeatures } from "../features";
import { useExecutionReport } from "../shared/hooks/useExecutionReport";
import { ShareConfigProps } from "@/block/shared/shareConfigProps";
import { ReferralProps } from "@/provider/appProvider";

export interface TradingPageContextValue {
  onSymbolChange?: (symbol: API.Symbol) => void;
  symbol: string;

  disableFeatures: TradingFeatures[];
  overrides?: Record<TradingFeatures, ReactNode>;
  sharePnlConfig?: ShareConfigProps;
  referral?: ReferralProps;
}

export const TradingPageContext = React.createContext<TradingPageContextValue>(
  {} as TradingPageContextValue
);

export interface TradingPageProviderProps {
  onSymbolChange?: (symbol: API.Symbol) => void;
  symbol: string;
  disableFeatures?: TradingFeatures[];
  overrides?: Record<TradingFeatures, ReactNode>;
  sharePnlConfig?: ShareConfigProps;
  referral?: ReferralProps;
}

export const useTradingPageContext = () => {
  return useContext(TradingPageContext);
};

export const TradingPageProvider: React.FC<
  PropsWithChildren<TradingPageProviderProps>
> = ({
  children,
  onSymbolChange,
  symbol,
  disableFeatures = [],
  overrides,
  sharePnlConfig,
  referral,
}) => {
  useExecutionReport();
  return (
    <TradingPageContext.Provider
      value={{
        onSymbolChange,
        symbol,
        disableFeatures,
        overrides,
        sharePnlConfig,
        referral,
      }}
    >
      {children}
    </TradingPageContext.Provider>
  );
};
