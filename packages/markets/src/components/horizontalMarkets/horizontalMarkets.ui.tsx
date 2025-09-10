import React from "react";
import { Box, cn, Flex, Marquee } from "@orderly.network/ui";
import type { HorizontalMarketsScriptReturn } from "./horizontalMarkets.script";
import { MarketItem } from "./marketItem.ui";
import { MarketTypeFilter } from "./marketTypeFilter.ui";

export type HorizontalMarketsProps = HorizontalMarketsScriptReturn & {
  className?: string;
};

export const HorizontalMarkets = React.memo<HorizontalMarketsProps>((props) => {
  const {
    symbols,
    tickerData,
    currentSymbol,
    onSymbolClick,
    selectedMarketType,
    onMarketTypeChange,
    className,
  } = props;

  // Memoize the render function to prevent unnecessary re-renders
  const renderMarketItem = React.useCallback(
    (symbol: string, index: number) => {
      const data = tickerData[symbol];
      const isActive = currentSymbol === symbol;

      if (!data) {
        return null;
      }

      const isLastItem = index === symbols.length - 1;

      return (
        <MarketItem
          key={`${symbol}-${index}`}
          symbol={symbol}
          tickerData={data}
          isActive={isActive}
          onSymbolClick={onSymbolClick}
          showDivider={!isLastItem}
        />
      );
    },
    [tickerData, currentSymbol, onSymbolClick, symbols.length],
  );

  const carouselOptions = React.useMemo(
    () => ({
      loop: true,
      align: "start" as const,
      axis: "x" as const,
    }),
    [],
  );

  const autoScrollOptions = React.useMemo(
    () => ({
      speed: 1,
      direction: "forward" as const,
      stopOnMouseEnter: true,
    }),
    [],
  );

  return (
    <Box
      className={cn(
        "oui-horizontal-markets",
        "oui-bg-base-9 oui-rounded-[12px]",
        "oui-w-full oui-px-3 oui-py-[7px]",
        className,
      )}
    >
      <Flex
        direction="row"
        gapX={3}
        itemAlign="center"
        className="oui-size-full"
      >
        {/* Filter Button */}
        <MarketTypeFilter
          selectedMarketType={selectedMarketType}
          onMarketTypeChange={onMarketTypeChange}
        />

        {/* Markets List */}
        <Marquee
          data={symbols}
          renderItem={renderMarketItem}
          carouselOptions={carouselOptions}
          autoScrollOptions={autoScrollOptions}
          className="oui-h-full"
        />
      </Flex>
    </Box>
  );
});

if (process.env.NODE_ENV !== "production") {
  HorizontalMarkets.displayName = "HorizontalMarkets";
}
