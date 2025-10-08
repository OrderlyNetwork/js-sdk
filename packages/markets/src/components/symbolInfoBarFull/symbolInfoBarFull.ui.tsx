import React, { ReactNode } from "react";
import { useFundingRate } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import {
  TokenIcon,
  Flex,
  Text,
  cn,
  Divider,
  NewsFillIcon,
  Box,
} from "@orderly.network/ui";
import { CloseIcon } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  ArrowLeftIcon,
  FavoritesIcon2,
  TriangleDownIcon,
  UnFavoritesIcon2,
} from "../../icons";
import type { MarketsProviderProps } from "../marketsProvider";
import { RwaTooltip } from "./rwaTooltip";
import type { UseSymbolInfoBarFullScriptReturn } from "./symbolInfoBarFull.script";

const LazyDropDownMarketsWidget = React.lazy(() =>
  import("../dropDownMarkets").then((mod) => {
    return { default: mod.DropDownMarketsWidget };
  }),
);

const LazyFavoritesDropdownMenuWidget = React.lazy(() =>
  import("../favoritesDropdownMenu").then((mod) => {
    return { default: mod.FavoritesDropdownMenuWidget };
  }),
);

const LazyDataItem = React.lazy(() =>
  import("./dataItem.ui").then((mod) => {
    return { default: mod.DataItem };
  }),
);

export type Layout = "left" | "right";

export type SymbolInfoBarFullProps = Pick<
  MarketsProviderProps,
  "onSymbolChange"
> &
  UseSymbolInfoBarFullScriptReturn & {
    className?: string;
    trailing?: ReactNode;
    closeCountdown?: () => void;
    showCountdown?: boolean;
  };

export const SymbolInfoBarFull: React.FC<SymbolInfoBarFullProps> = (props) => {
  const {
    symbol,
    isFavorite,
    favorite,
    data,
    quotoDp,
    openInterest,
    containerRef,
    leadingElementRef,
    tailingElementRef,
    leadingVisible,
    tailingVisible,
    onScoll,
    fundingPeriod,
    capFunding,
    floorFunding,
    isRwa,
    open,
    closeTimeInterval,
    openTimeInterval,
    closeCountdown,
    showCountdown,
  } = props;

  const { t } = useTranslation();

  const favoriteIcon = (
    <React.Suspense fallback={null}>
      <LazyFavoritesDropdownMenuWidget row={{ symbol }} favorite={favorite}>
        <Flex
          width={12}
          height={12}
          justify="center"
          itemAlign="center"
          className="oui-mr-1 oui-cursor-pointer"
        >
          {isFavorite ? (
            <FavoritesIcon2 className="oui-size-3 oui-text-[rgba(255,154,46,1)]" />
          ) : (
            <UnFavoritesIcon2 className="oui-size-3 oui-text-base-contrast-36 hover:oui-text-[rgba(255,154,46,1)]" />
          )}
        </Flex>
      </LazyFavoritesDropdownMenuWidget>
    </React.Suspense>
  );

  const symbolView = (
    <React.Suspense fallback={null}>
      <Flex direction="column" itemAlign="start" className="oui-gap-y-[2px]">
        <LazyDropDownMarketsWidget
          contentClassName="oui-w-[429px] oui-h-[496px]"
          symbol={props.symbol}
          onSymbolChange={props.onSymbolChange}
        >
          <Flex gapX={1} className="oui-cursor-pointer">
            <TokenIcon symbol={symbol} className="oui-size-4" />
            <Text.formatted
              className="oui-whitespace-nowrap oui-break-normal"
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
        </LazyDropDownMarketsWidget>
        {isRwa && (
          <RwaTooltip
            isRwa={isRwa}
            open={open}
            closeTimeInterval={closeTimeInterval}
            openTimeInterval={openTimeInterval}
          />
        )}
      </Flex>
    </React.Suspense>
  );

  const price = (
    <Text.numeral
      dp={quotoDp || 2}
      currency="$"
      size="sm"
      intensity={98}
      className="oui-data-value"
    >
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
    <Flex direction="column" className="oui-h-full oui-w-full">
      <Flex
        className={cn(
          "oui-symbol-info-bar-desktop",
          "oui-font-semibold",
          "oui-flex-1 oui-w-full",
          props.className,
        )}
        // fix Safari text opacity transition bug
        style={{
          transform: "translateZ(0)",
          willChange: "transform",
        }}
      >
        <Flex gapX={6} className="oui-h-full oui-flex-1 oui-overflow-hidden">
          <Flex gapX={1}>
            {favoriteIcon}
            {symbolView}
          </Flex>
          <Divider
            className="oui-h-[26px]"
            direction="vertical"
            intensity={8}
          />
          {price}
          <div className="oui-relative oui-h-full oui-overflow-hidden">
            <div
              ref={containerRef}
              className="oui-hide-scrollbar oui-h-full oui-overflow-x-auto"
            >
              <Flex gapX={8} height="100%">
                <div ref={leadingElementRef}>
                  <React.Suspense fallback={null}>
                    <LazyDataItem
                      label={t("markets.column.24hChange")}
                      value={change}
                    />
                  </React.Suspense>
                </div>
                <React.Suspense fallback={null}>
                  <LazyDataItem
                    label={t("markets.symbolInfoBar.Mark")}
                    value={
                      <Text.numeral
                        dp={quotoDp}
                        data-testid="oui-testid-tokenInfo-markPrice-value"
                      >
                        {data?.["mark_price"]}
                      </Text.numeral>
                    }
                    hint={t("markets.symbolInfoBar.Mark.tooltip")}
                  />
                </React.Suspense>
                <React.Suspense fallback={null}>
                  <LazyDataItem
                    label={t("markets.symbolInfoBar.Index")}
                    value={
                      <Text.numeral dp={quotoDp}>
                        {data?.["index_price"]}
                      </Text.numeral>
                    }
                    hint={t("markets.symbolInfoBar.Index.tooltip")}
                  />
                </React.Suspense>
                <React.Suspense fallback={null}>
                  <LazyDataItem
                    label={t("markets.symbolInfoBar.24hVolume")}
                    value={
                      <Text.numeral rule="human" dp={2}>
                        {data?.["24h_amount"]}
                      </Text.numeral>
                    }
                    hint={t("markets.symbolInfoBar.24hVolume.tooltip")}
                  />
                </React.Suspense>
                <React.Suspense fallback={null}>
                  <LazyDataItem
                    label={t("markets.symbolInfoBar.predFundingRate")}
                    value={<FundingRate symbol={symbol} />}
                    hint={
                      <Flex
                        width={"100%"}
                        itemAlign={"center"}
                        direction="column"
                        gap={1}
                      >
                        <Flex
                          justify="between"
                          itemAlign={"center"}
                          width={"100%"}
                        >
                          <Text intensity={54}>
                            {t("trading.fundingRate.predFundingRate.interval")}
                          </Text>
                          <Text intensity={80}>{fundingPeriod}</Text>
                        </Flex>
                        <Flex
                          justify="between"
                          itemAlign={"center"}
                          width={"100%"}
                        >
                          <Text intensity={54}>
                            {t("trading.fundingRate.predFundingRate.cap")} /
                            {t("trading.fundingRate.predFundingRate.floor")}
                          </Text>
                          <Text intensity={80}>
                            {capFunding} / {floorFunding}
                          </Text>
                        </Flex>
                        <Divider className="oui-w-full" intensity={8} />
                        {t("markets.symbolInfoBar.predFundingRate.tooltip")}
                      </Flex>
                    }
                  />
                </React.Suspense>

                <div ref={tailingElementRef}>
                  <React.Suspense fallback={null}>
                    <LazyDataItem
                      label={t("markets.openInterest")}
                      value={
                        <>
                          <Text.numeral rule="human" dp={2}>
                            {openInterest}
                          </Text.numeral>
                          <Text intensity={36}>{` USDC`}</Text>
                        </>
                      }
                      hint={t("markets.openInterest.tooltip")}
                    />
                  </React.Suspense>
                </div>
              </Flex>
            </div>
            <ScrollIndicator
              leading
              onClick={onScoll}
              visible={leadingVisible}
            />
            <ScrollIndicator
              tailing
              onClick={onScoll}
              visible={tailingVisible}
            />
          </div>
        </Flex>
        {props.trailing}
      </Flex>
      {showCountdown && <RwaCountdown
        closeCountdown={closeCountdown}
        isRwa={isRwa}
        open={open}
        closeTimeInterval={closeTimeInterval}
      />}
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
  if (!visible) {
    return null;
  }

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
        "oui-flex oui-w-[80px] oui-items-center",
        "oui-absolute oui-inset-y-0 oui-rounded-l",
        leading && "oui-left-0 oui-pl-1",
        tailing && "oui-right-0 oui-rotate-180 oui-pr-1",
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
    <div>
      <Text.numeral unit="%" dp={4} className="oui-text-[#FF9A2E]">
        {data.est_funding_rate!}
      </Text.numeral>
      <Text intensity={36} className="oui-tabular-nums">
        {/* not need to translate  */}
        {` in ${data.countDown}`}
      </Text>
    </div>
  );
};

const RwaCountdown: React.FC<{
  closeCountdown?: () => void;
  isRwa: boolean;
  open: boolean | undefined;
  closeTimeInterval: number | undefined;
}> = ({ closeCountdown, isRwa, open, closeTimeInterval }) => {
  const { t } = useTranslation();
  if (!isRwa || closeTimeInterval === undefined || open === undefined || closeTimeInterval > 30 * 60) {
    return null;
  }
  if (!open) {
    return null;
  }

  const minutes = closeTimeInterval ? Math.floor(closeTimeInterval / 60) : 0;
  const minutesStr = minutes.toString().padStart(2, "0");
  const seconds = closeTimeInterval ? closeTimeInterval % 60 : 0;
  const secondsStr = seconds.toString().padStart(2, "0");

  return (
    <Flex
      itemAlign="center"
      px={2}
      r="lg"
      className="oui-w-full oui-text-warning-darken oui-bg-warning-darken/15 oui-flex-1 oui-my-2 oui-text-sm"
    >
      <Flex className="oui-w-full oui-pr-2">
        <NewsFillIcon className="oui-text-warning-darken" size={16}/>
        <Flex>
          {t("trading.rwa.countdown.title")}
          <Flex className="oui-text-base-contrast-54 oui-text-xs oui-font-normal">
            <Box
              ml={2}
              className="oui-bg-base-7 oui-px-1 oui-rounded-md oui-text-base-contrast oui-min-w-[22px] oui-text-center oui-text-xs"
            >
              {minutesStr}
            </Box>
            {t("common.minuteShort")}
            {" : "}
            <Box
              ml={1}
              className="oui-bg-base-7 oui-px-1 oui-rounded-md oui-text-base-contrast oui-min-w-[22px] oui-text-center oui-text-xs"
            >
              {secondsStr}
            </Box>
            {t("common.secondShort")}
          </Flex>
        </Flex>
      </Flex>

      <button className="oui-cursor-pointer" onClick={closeCountdown}>
        <CloseIcon className="oui-text-base-contrast" size={16} opacity={1} />
      </button>
    </Flex>
  );
};
