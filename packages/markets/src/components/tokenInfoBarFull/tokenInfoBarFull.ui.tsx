import {
  TokenIcon,
  Flex,
  Text,
  cn,
  Divider,
  Tooltip,
} from "@orderly.network/ui";
import { UseTokenInfoBarFullScriptReturn } from "./tokenInfoBarFull.script";
import { FavoritesDropdownMenuWidget } from "../favoritesDropdownMenu";
import {
  ArrowLeftIcon,
  FavoritesIcon2,
  TriangleDownIcon,
  UnFavoritesIcon2,
} from "../../icons";
import { Decimal } from "@orderly.network/utils";
import { ReactNode, useEffect } from "react";
import { DropDownMarketsWidget } from "../dropDownMarkets";
import { MarketsProviderProps } from "../marketsProvider";
import { useFundingRate } from "@orderly.network/hooks";

export type Layout = "left" | "right";

export type TokenInfoBarFullProps = Pick<
  MarketsProviderProps,
  "onSymbolChange"
> &
  UseTokenInfoBarFullScriptReturn & {
    className?: string;
    trailing?: ReactNode;
  };

export const TokenInfoBarFull: React.FC<TokenInfoBarFullProps> = (props) => {
  const {
    symbol,
    isFavorite,
    favorite,
    data,
    quotoDp,
    openInterest,
    fundingRate,
    containerRef,
    leadingElementRef,
    tailingElementRef,
    leadingVisible,
    tailingVisible,
    onScoll,
  } = props;

  const favoriteIcon = (
    <FavoritesDropdownMenuWidget row={{ symbol }} favorite={favorite}>
      <Flex
        width={12}
        height={12}
        justify="center"
        itemAlign="center"
        className="oui-cursor-pointer oui-mr-1"
      >
        {isFavorite ? (
          <FavoritesIcon2 className="oui-w-3 oui-h-3 oui-text-[rgba(255,154,46,1)]" />
        ) : (
          <UnFavoritesIcon2 className="oui-w-3 oui-h-3 oui-text-base-contrast-36 hover:oui-text-[rgba(255,154,46,1)]" />
        )}
      </Flex>
    </FavoritesDropdownMenuWidget>
  );

  const symbolView = (
    <DropDownMarketsWidget
      contentClassName="oui-w-[429px] oui-h-[496px]"
      symbol={props.symbol}
      onSymbolChange={props.onSymbolChange}
    >
      <Flex gapX={1} className="oui-cursor-pointer">
        <TokenIcon symbol={symbol} className="oui-w-4 oui-h-4" />
        <Text.formatted
          className="oui-break-normal oui-whitespace-nowrap"
          rule="symbol"
          formatString="base-type"
          size="xs"
          weight="semibold"
          intensity={98}
        >
          {symbol}
        </Text.formatted>
        <TriangleDownIcon className="oui-text-base-contrast-54" />
      </Flex>
    </DropDownMarketsWidget>
  );

  const price = (
    <Text.numeral dp={quotoDp || 2} currency="$" size="sm" intensity={98}>
      {data?.["24h_close"]}
    </Text.numeral>
  );

  const change = (
    <>
      <Text.numeral coloring rm={Decimal.ROUND_DOWN} showIdentifier>
        {data?.["24h_change"]!}
      </Text.numeral>
      <Text intensity={36}>/</Text>
      <Text.numeral
        rule="percentages"
        coloring
        rm={Decimal.ROUND_DOWN}
        showIdentifier
      >
        {data?.["change"]!}
      </Text.numeral>
    </>
  );

  return (
    <Flex
      className={cn("oui-font-semibold oui-h-[54px]", props.className)}
      // fix Safari text opacity transition bug
      style={{
        transform: "translateZ(0)",
        willChange: "transform",
      }}
    >
      <Flex gapX={6} className="oui-flex-1 oui-overflow-hidden oui-h-full">
        <Flex gapX={1}>
          {favoriteIcon}
          {symbolView}
        </Flex>
        <Divider className="oui-h-[26px]" direction="vertical" intensity={8} />
        {price}
        <div className="oui-relative oui-overflow-hidden oui-h-full">
          <div
            ref={containerRef}
            className="oui-overflow-x-auto oui-hide-scrollbar oui-h-full"
          >
            <Flex gapX={8} height="100%">
              <div ref={leadingElementRef}>
                <DataItem label="24h Change" value={change} />
              </div>
              <DataItem
                label="Mark"
                value={
                  <Text.numeral dp={quotoDp} data-testid="oui-testid-tokenInfo-${props.label.toLowerCase()}-value">
                    {data?.["mark_price"]}
                  </Text.numeral>
                }
                hint="Price for the computation of unrealized PnL and liquidation."
              />
              <DataItem
                label="Index"
                value={
                  <Text.numeral dp={quotoDp}>
                    {data?.["index_price"]}
                  </Text.numeral>
                }
                hint="Average of the last prices across other exchanges."
              />
              <DataItem
                label="24h volume"
                value={
                  <Text.numeral rule="human" dp={2}>
                    {data?.["24h_amount"]}
                  </Text.numeral>
                }
                hint="24 hour total trading volume on the Orderly Network."
              />
              <DataItem
                label="Pred. funding rate"
                value={<FundingRate symbol={symbol} />}
                hint="Funding rates are payments between traders who are long and short. When positive, long positions pay short positions funding. When negative, short positions pay long positions."
              />
              <div ref={tailingElementRef}>
                <DataItem
                  label="Open interest"
                  value={
                    <>
                      <Text.numeral rule="human" dp={2}>
                        {openInterest}
                      </Text.numeral>
                      <Text intensity={36}>{` USDC`}</Text>
                    </>
                  }
                  hint="Total size of positions per side."
                />
              </div>
            </Flex>
          </div>
          <ScrollIndicator leading onClick={onScoll} visible={leadingVisible} />
          <ScrollIndicator tailing onClick={onScoll} visible={tailingVisible} />
        </div>
      </Flex>
      {props.trailing}
    </Flex>
  );
};

type DataItemProps = {
  label: string;
  value: ReactNode;
  hint?: string;
};

const DataItem: React.FC<DataItemProps> = (props) => {
  return (
    <Flex direction="column" itemAlign="start">
      <Tooltip
        open={props.hint ? undefined : false}
        content={props.hint}
        className="oui-max-w-[240px] oui-bg-base-6 "
        arrow={{ className: "oui-fill-base-6" }}
        delayDuration={300}
      >
        <Text
          size="2xs"
          intensity={36}
          className={cn(
            "oui-break-normal oui-whitespace-nowrap",
            props.hint &&
              "oui-cursor-pointer oui-border-b oui-border-dashed oui-border-line-12"
          )}
        >
          {props.label}
        </Text>
      </Tooltip>
      <Text
        size="2xs"
        intensity={98}
        className="oui-leading-[20px] oui-break-normal oui-whitespace-nowrap"
      >
        {props.value}
      </Text>
    </Flex>
  );
};

type ScrollIndicatorProps = {
  tailing?: boolean;
  leading?: boolean;
  visible?: boolean;
  onClick?: (direction: string) => void;
};

const ScrollIndicator: React.FC<ScrollIndicatorProps> = (props) => {
  const { visible, leading, tailing, onClick } = props;
  if (!visible) return null;

  return (
    <button
      onClick={() => {
        onClick?.(leading ? "left" : "right");
      }}
      style={{
        background:
          "linear-gradient(90deg, #07080A 0%, rgba(7, 8, 10, 0.60) 65%, rgba(7, 8, 10, 0.00) 100%)",
      }}
      className={cn(
        "oui-flex oui-items-center oui-w-[80px]",
        "oui-absolute oui-top-0 oui-bottom-0 oui-rounded-l",
        leading && "oui-left-0 oui-pl-1",
        tailing && "oui-right-0 oui-pr-1 oui-rotate-180"
      )}
    >
      <ArrowLeftIcon className="oui-text-base-contrast-54 hover:oui-text-base-contrast-80" />
    </button>
  );
};

const FundingRate: React.FC<{ symbol: string }> = ({ symbol }) => {
  const data = useFundingRate(symbol);

  if (data?.est_funding_rate === null) {
    return "--";
  }

  return (
    <div className="">
      <Text.numeral unit="%" dp={4} className="oui-text-[#FF9A2E]">
        {data.est_funding_rate!}
      </Text.numeral>
      <Text
        intensity={36}
        className="oui-tabular-nums"
      >{` in ${data.countDown}`}</Text>
    </div>
  );
};
