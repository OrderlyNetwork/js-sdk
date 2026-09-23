import React, { useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import type { LocaleMessages } from "@orderly.network/i18n";
import {
  DataItem,
  DropDownMarketsWidget,
  TriangleDownIcon,
} from "@orderly.network/markets";
import {
  ChevronUpIcon,
  cn,
  TabPanel,
  Tabs,
  Text,
  toast,
  TokenIcon,
  useMediaQuery,
} from "@orderly.network/ui";
import type { PredictionState } from "./prediction.script";
import { PriceChart } from "./predictionChart.ui";
import { PredictionDataPanel } from "./predictionDataPanels.ui";
import {
  PredictionMarketPanel,
  usePredictionMarketTabs,
  type PredictionMarketRowProps,
} from "./predictionMarketPanel.ui";
import { usePredictionFavorites } from "./predictionMockData.script";
import {
  PredictionOrderBook,
  RoundOrderStatusCard,
  TradePanel,
} from "./predictionOrderEntry.ui";
import { formatPercent, usePredictionFormatters } from "./predictionShared";

// Re-exported here so the package entry keeps importing every public
// prediction surface from one module.
export {
  PredictionDataPanel,
  PredictionOrderCell,
  PredictionOrdersTable,
  SharedProductDataPanel,
  SharedProductOrdersPanel,
} from "./predictionDataPanels.ui";
export type { PredictionDataPanelProps } from "./predictionDataPanels.ui";

const MobileMarketPanel: React.FC<PredictionState> = (state) => {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"chart" | "data">("chart");
  const [contentVisible, setContentVisible] = useState(true);

  return (
    <Tabs
      value={tab}
      onValueChange={(value) => setTab(value as "chart" | "data")}
      variant="contained"
      size="lg"
      contentVisible={contentVisible}
      className="oui-prediction-mobileMarket-tabs oui-overflow-hidden oui-rounded-xl oui-bg-base-9"
      classNames={{
        tabsList: "oui-p-2",
        tabsContent: "oui-min-h-[360px]",
      }}
      trailing={
        <button
          type="button"
          aria-expanded={contentVisible}
          className="oui-px-5 oui-text-base-contrast-54 hover:oui-text-base-contrast-80"
          onClick={() => setContentVisible((visible) => !visible)}
        >
          <ChevronUpIcon
            className={cn(
              "oui-transition-transform",
              !contentVisible && "oui-rotate-180",
            )}
            size={14}
            color="inherit"
          />
        </button>
      }
    >
      <TabPanel title={t("trading.tabs.chart")} value="chart">
        <PriceChart
          selectedRound={state.selectedRound}
          onSelectRound={state.selectMarketRound}
          points={state.priceHistory}
          openingPrice={state.openingPrice}
          currentPrice={state.currentPrice}
          round={state.round}
          countdown={state.countdown}
          roundPhase={state.roundPhase}
          onGoToLiveMarket={state.goToLiveRound}
        />
      </TabPanel>
      <TabPanel title={t("trading.tabs.data")} value="data">
        <div className="oui-h-[360px] oui-space-y-2 oui-rounded-b-xl oui-bg-base-9 oui-px-4 oui-pb-4">
          <div className="oui-flex oui-w-full oui-items-center oui-justify-between oui-text-xs">
            <Text intensity={36}>{t("prediction.chart.btcPrice")}</Text>
            <Text.numeral dp={2} intensity={80}>
              {state.currentPrice}
            </Text.numeral>
          </div>
          <div className="oui-flex oui-w-full oui-items-center oui-justify-between oui-text-xs">
            <Text intensity={36}>{t("prediction.chance")}</Text>
            <Text intensity={98}>{formatPercent(state.upChance)}</Text>
          </div>
        </div>
      </TabPanel>
    </Tabs>
  );
};

export const Prediction: React.FC<
  PredictionState & {
    accountPanel?: React.ReactNode;
    orderEntryAccountReady?: boolean;
    orderEntryFunded?: boolean;
    orderEntryRestricted?: boolean;
  }
> = (state) => {
  const { t } = useTranslation();
  const { formatRoundWindow } = usePredictionFormatters();
  const isDesktopLayout = useMediaQuery("(min-width: 1280px)");
  const predictionMarketTabs = usePredictionMarketTabs();

  useEffect(() => {
    if (!state.notification) return;

    const message = String(
      t(state.notification.message as keyof LocaleMessages),
    );
    if (state.notification.tone === "danger") {
      toast.error(message);
    } else {
      toast.success(message);
    }
    // Consume the notification so it does not replay on the next remount.
    state.clearNotification();
  }, [state.notification, t]);

  const { isFavorite: isPredictionFavorite, toggleFavorite } =
    usePredictionFavorites();
  const predictionMarketRowProps: PredictionMarketRowProps = {
    countdown: state.countdown,
    isRoundTradable: state.isRoundTradable,
    outcomePrices: state.outcomePrices,
    round: state.round,
    upChance: state.upChance,
    isFavorite: isPredictionFavorite,
    onToggleFavorite: toggleFavorite,
    onSelect: () => undefined,
  };
  // TODO: Wire cross-market navigation before the prototype is promoted.
  const handleDropdownSymbolChange = () => undefined;

  // Prediction favorites render as a separate section because they are not
  // part of the current Perps markets data source.

  const orderEntryAccountReady = state.orderEntryRestricted
    ? false
    : (state.orderEntryAccountReady ?? false);
  const orderEntryFunded = state.orderEntryRestricted
    ? false
    : (state.orderEntryFunded ?? false);

  return (
    <main
      id="oui-prediction-page"
      className="oui-min-h-[calc(100vh-64px)] oui-bg-base-10 oui-p-3 oui-font-semibold lg:oui-p-4"
    >
      <div className="oui-grid oui-gap-3 md:oui-grid-cols-2 md:oui-items-stretch xl:oui-grid-cols-[minmax(0,1fr)_280px_360px] xl:oui-grid-rows-[auto_auto_auto]">
        <header className="oui-flex oui-flex-col oui-gap-4 oui-rounded-2xl oui-bg-base-9 oui-p-4 md:oui-col-span-2 md:oui-col-start-1 md:oui-row-start-1 xl:oui-col-span-1 xl:oui-col-start-1 xl:oui-row-start-1 2xl:oui-flex-row 2xl:oui-items-center">
          <DropDownMarketsWidget
            symbol="PERP_BTC_USDC"
            tabs={predictionMarketTabs}
            contentClassName="oui-h-[560px] oui-w-[920px] oui-max-w-[calc(100vw-24px)]"
            onSymbolChange={handleDropdownSymbolChange}
            renderTabContent={(_, key, hide) =>
              key === "prediction" ? (
                <PredictionMarketPanel
                  {...predictionMarketRowProps}
                  onSelect={hide}
                />
              ) : undefined
            }
            renderTabAfterContent={(_, key, hide) =>
              key === "favorites" && isPredictionFavorite ? (
                <PredictionMarketPanel
                  {...predictionMarketRowProps}
                  className="oui-flex-none oui-border-t oui-border-line-12 oui-pt-2"
                  showFavoriteControl={false}
                  onSelect={hide}
                />
              ) : null
            }
          >
            <button
              type="button"
              className="oui-flex oui-min-w-0 oui-items-center oui-gap-3 oui-text-start 2xl:oui-w-[340px] 2xl:oui-shrink-0"
            >
              <TokenIcon name="BTC" size="lg" />
              <div className="oui-min-w-0 oui-flex-1">
                <h1 className="oui-flex oui-items-center oui-gap-1 oui-truncate oui-text-base oui-font-semibold oui-text-base-contrast">
                  <span className="oui-truncate">
                    {t("prediction.btcUpDown")}
                  </span>
                  <TriangleDownIcon className="oui-flex-none oui-text-base-contrast-54" />
                </h1>
                <div className="oui-mt-0.5 oui-truncate oui-text-xs oui-font-normal oui-text-base-contrast-54">
                  {formatRoundWindow(state.round)}
                </div>
              </div>
            </button>
          </DropDownMarketsWidget>

          <div className="oui-hidden oui-h-12 oui-w-px oui-flex-shrink-0 oui-bg-line-12 2xl:oui-block" />

          <div className="oui-hidden oui-min-w-0 oui-flex-1 oui-grid-cols-2 oui-items-center oui-gap-x-6 oui-gap-y-3 sm:oui-grid-cols-3 xl:oui-grid 2xl:oui-flex 2xl:oui-flex-wrap 2xl:oui-gap-x-8">
            <DataItem
              label={t("prediction.chart.btcPrice")}
              value={<Text.numeral dp={2}>{state.currentPrice}</Text.numeral>}
            />
            <DataItem
              label={t("prediction.chance")}
              value={
                <Text intensity={98}>{formatPercent(state.upChance)}</Text>
              }
            />
          </div>
        </header>

        <div className="oui-min-w-0 md:oui-col-span-2 md:oui-col-start-1 md:oui-row-start-2 xl:oui-col-span-1 xl:oui-col-start-1 xl:oui-row-start-2">
          {/* Mount a single chart per breakpoint: each PriceChart runs its own
              candle-simulation interval, so keeping both alive doubles the
              per-second work. */}
          {isDesktopLayout ? (
            <PriceChart
              selectedRound={state.selectedRound}
              onSelectRound={state.selectMarketRound}
              points={state.priceHistory}
              openingPrice={state.openingPrice}
              currentPrice={state.currentPrice}
              round={state.round}
              countdown={state.countdown}
              roundPhase={state.roundPhase}
              onGoToLiveMarket={state.goToLiveRound}
            />
          ) : (
            <MobileMarketPanel {...state} />
          )}
        </div>
        <div className="oui-min-w-0 md:oui-col-start-1 md:oui-row-start-3 xl:oui-col-start-2 xl:oui-row-span-2 xl:oui-row-start-1">
          <PredictionOrderBook
            orderBook={state.orderBook}
            selectedOutcome={state.selectedOutcome}
            selectedPrice={state.selectedPrice}
            setLimitPrice={state.setLimitPrice}
            setOrderType={state.setOrderType}
            isRoundTradable={state.isRoundTradable}
            roundPhase={state.roundPhase}
          />
        </div>
        <div
          className={cn(
            "oui-space-y-3 md:oui-col-start-2 md:oui-row-start-3 xl:oui-col-start-3 xl:oui-row-span-3 xl:oui-row-start-1",
            (state.isRegionRestricted || state.orderEntryRestricted) &&
              "oui-flex oui-flex-col oui-self-stretch xl:oui-block",
          )}
        >
          {state.accountPanel && (
            <div className="oui-rounded-2xl oui-border oui-border-line-12 oui-bg-base-9 oui-p-3">
              {state.accountPanel}
            </div>
          )}
          {state.isRegionRestricted || state.orderEntryRestricted ? (
            <RoundOrderStatusCard
              round={state.selectedRound}
              roundPhase={state.roundPhase}
              restricted
            />
          ) : state.isRoundTradable ? (
            <TradePanel
              {...state}
              orderEntryAccountReady={orderEntryAccountReady}
              orderEntryFunded={orderEntryFunded}
            />
          ) : (
            <RoundOrderStatusCard
              round={state.round}
              roundPhase={state.roundPhase}
            />
          )}
        </div>
        {/* Height mirrors perp DataList bounds (min 350 / max 800), but without
            a splitter we size from the viewport so the panel is taller than the
            350px initial default most users drag up to on perp. */}
        <div className="oui-h-[min(800px,max(420px,42vh))] oui-min-h-0 oui-min-w-0 oui-overflow-hidden md:oui-col-span-2 md:oui-col-start-1 md:oui-row-start-4 xl:oui-row-start-3">
          <PredictionDataPanel state={state} />
        </div>
      </div>
    </main>
  );
};
