import React from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Box,
  cn,
  Flex,
  Text,
  TokenIcon,
  Badge,
  Marquee,
  Divider,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import type { HorizontalMarketsScriptReturn } from "./horizontalMarkets.script";
import { MarketTypeFilter } from "./marketTypeFilter.ui";

export type HorizontalMarketsProps = HorizontalMarketsScriptReturn & {
  className?: string;
};

export const HorizontalMarkets: React.FC<HorizontalMarketsProps> = (props) => {
  const {
    symbols,
    tickerData,
    currentSymbol,
    onSymbolClick,
    selectedMarketType,
    onMarketTypeChange,
    className,
  } = props;
  const { t } = useTranslation();

  const renderMarketItem = (symbol: string, index: number) => {
    const data = tickerData[symbol];
    const isActive = currentSymbol === symbol;

    if (!data) return null;

    return (
      <React.Fragment key={`${symbol}-${index}`}>
        <Flex
          direction="row"
          className={cn(
            "oui-cursor-pointer oui-rounded oui-h-[18px] oui-items-center oui-mr-3 oui-flex-shrink-0",
            "oui-transition-all oui-duration-200",
            isActive
              ? "oui-bg-primary-darken oui-text-primary"
              : "hover:oui-bg-base-6",
          )}
          onClick={() => onSymbolClick(symbol)}
        >
          {/* Symbol */}
          <Flex gapX={1} itemAlign="center" className="oui-mr-[6px]">
            <TokenIcon symbol={symbol} className="oui-size-[18px]" />
            <Text.formatted
              rule="symbol"
              formatString="base"
              size="xs"
              weight="semibold"
              className={cn(
                isActive ? "oui-text-primary" : "oui-text-base-contrast",
              )}
            >
              {symbol}
            </Text.formatted>
          </Flex>

          {/* Price */}
          <Flex gapX={1} className="oui-mr-[6px]">
            <Text.numeral
              dp={2}
              size="xs"
              className={cn(
                isActive ? "oui-text-primary" : "oui-text-base-contrast-80",
              )}
            >
              {data["24h_close"]}
            </Text.numeral>
          </Flex>

          {/* Change */}
          <Text.numeral
            rule="percentages"
            coloring
            rm={Decimal.ROUND_DOWN}
            showIdentifier
            size="xs"
          >
            {data.change}
          </Text.numeral>
        </Flex>

        {/* Divider */}
        <Divider direction="vertical" className="oui-h-[18px] oui-mr-3" />
      </React.Fragment>
    );
  };

  return (
    <Box
      className={cn(
        "oui-horizontal-markets",
        "oui-bg-base-9 oui-rounded-[12px]",
        "oui-px-3 oui-py-[7px] oui-w-full",
        className,
      )}
    >
      <Flex
        direction="row"
        gapX={3}
        itemAlign="center"
        className="oui-w-full oui-h-full"
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
          carouselOptions={{
            loop: true,
            align: "start",
            axis: "x",
          }}
          autoScrollOptions={{
            speed: 1,
            direction: "forward",
            stopOnMouseEnter: true,
          }}
          className="oui-h-full"
        />
        {/* <div style={{ height: '20px', minWidth: '400px'}}> */}
        {/* <Marquee
            data={[
              'Welcome to Orderly Network',
              'Decentralized Trading Protocol',
              'Built for the Future of Finance',
              'Secure • Fast • Reliable',
              'Join the Revolution'
            ]}
            renderItem={(text) => {
              return <div style={{ height: '20px', minWidth: '400px'}}>{text}</div>
            }}
            direction="left"
            mode="continuous"
            speed={30}
            // className="oui-h-20px"
          /> */}
        {/* </div> */}
      </Flex>
    </Box>
  );
};
