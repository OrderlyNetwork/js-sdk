import React from "react";
import { injectable } from "@orderly.network/ui";
import type { TradingviewDesktopLayoutProps } from "../type";
import { TradingviewDesktopLayout } from "./tradingview.ui";

const InjectableTradingviewDesktop = injectable<TradingviewDesktopLayoutProps>(
  TradingviewDesktopLayout,
  "TradingView.Desktop",
);

/**
 * Extension slot for TradingView desktop layout. Plugins can register interceptors
 * for 'TradingView.Desktop' via OrderlyPluginProvider.
 */
export const TradingviewDesktopExtension: React.FC<
  TradingviewDesktopLayoutProps
> = (props) => {
  return <InjectableTradingviewDesktop {...props} />;
};

export { InjectableTradingviewDesktop };
