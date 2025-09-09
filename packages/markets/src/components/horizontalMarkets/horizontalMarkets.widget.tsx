import React from "react";
import { MarketsProvider, MarketsProviderProps } from "../marketsProvider";
import { useHorizontalMarketsScript } from "./horizontalMarkets.script";
import type { HorizontalMarketsProps } from "./horizontalMarkets.ui";

const LazyHorizontalMarkets = React.lazy(() =>
  import("./horizontalMarkets.ui").then((mod) => {
    return { default: mod.HorizontalMarkets };
  }),
);

export type HorizontalMarketsWidgetProps = MarketsProviderProps &
  Partial<Pick<HorizontalMarketsProps, "symbols" | "className">> & {
    maxItems?: number;
    defaultMarketType?:
      | "all"
      | "recent"
      | "newListing"
      | "favorites"
      | "trending";
  };

export const HorizontalMarketsWidget: React.FC<HorizontalMarketsWidgetProps> = (
  props,
) => {
  const { symbols, maxItems, className, defaultMarketType, ...providerProps } =
    props;

  const state = useHorizontalMarketsScript({
    symbols,
    maxItems,
    defaultMarketType,
  });

  return (
    <MarketsProvider {...providerProps}>
      <React.Suspense fallback={null}>
        <LazyHorizontalMarkets {...state} className={className} />
      </React.Suspense>
    </MarketsProvider>
  );
};
