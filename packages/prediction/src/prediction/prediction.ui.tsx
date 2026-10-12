import React, { useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import type { LocaleMessages } from "@orderly.network/i18n";
import {
  DataItem,
  DropDownMarketsWidget,
  TriangleDownIcon,
} from "@orderly.network/markets-core";
import type { API } from "@orderly.network/types";
import {
  ChevronUpIcon,
  cn,
  Spinner,
  TabPanel,
  Tabs,
  Text,
  toast,
  TokenIcon,
  useMediaQuery,
  useScreen,
} from "@orderly.network/ui";
import { PredictionAccountPanel } from "./dataPanels/predictionAccountPanel.widget";
import { usePredictionPanelMarketView } from "./hooks/usePredictionPanelMarketView";
import {
  PredictionOrderBook,
  RoundOrderStatusCard,
  TradePanel,
} from "./orderEntry";
import type { PredictionState } from "./prediction.script";
import { PriceChart } from "./predictionChart.ui";
import { formatPredictionMarketName } from "./predictionMarketPanel.ui";
import { formatPercent, usePredictionFormatters } from "./predictionShared";
import { RoundResultWidget } from "./roundResult";
import { usePredictionMarketsDropdown } from "./usePredictionMarketsDropdown";

// Re-exported here so the package entry keeps importing every public
// prediction surface from one module.
export {
  PredictionDataPanel,
  PredictionOrderCell,
  PredictionOrdersTable,
  SharedProductDataPanel,
  SharedProductOrdersPanel,
  MobileSharedProductOrdersPanel,
  MobileSharedProductHistory,
  useSharedProductCounts,
} from "./dataPanels";
export type { PredictionDataPanelProps } from "./dataPanels";

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
          key={state.marketId}
          intervalSeconds={state.market?.intervalSeconds ?? 300}
          base={state.market?.base ?? ""}
          selectedRound={state.selectedRound}
          onSelectRound={state.selectMarketRound}
          points={state.priceHistory}
          candles={state.candles}
          roundOutcome={state.roundOutcomeLookup}
          selectedRow={state.selectedRow}
          rows={state.marketRows}
          currentPrice={state.chartIndexPrice}
          round={state.round}
          onGoToLiveMarket={state.goToLiveRound}
        />
      </TabPanel>
      <TabPanel title={t("trading.tabs.data")} value="data">
        <div className="oui-h-[360px] oui-space-y-2 oui-rounded-b-xl oui-bg-base-9 oui-px-4 oui-pb-4">
          <div className="oui-text-xs oui-flex oui-w-full oui-items-center oui-justify-between">
            <Text intensity={36}>
              {t("prediction.chart.indexPrice", {
                base: state.market?.base ?? "",
              })}
            </Text>
            <Text.numeral dp={2} intensity={80}>
              {state.currentPrice}
            </Text.numeral>
          </div>
          <div className="oui-text-xs oui-flex oui-w-full oui-items-center oui-justify-between">
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
    onNavigatePerp?: (symbol: API.Symbol) => void;
    requestedSymbol?: string;
    onSelectSymbol?: (symbol: string) => void;
  }
> = (state) => {
  const { t } = useTranslation();
  const { formatRoundWindow } = usePredictionFormatters();
  const isDesktopLayout = useMediaQuery("(min-width: 1280px)");
  const { isMobile } = useScreen();
  const panelMarketView = usePredictionPanelMarketView(state);
  const marketsDropdown = usePredictionMarketsDropdown(state.onSelectSymbol);

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

  const orderEntryAccountReady = state.orderEntryRestricted
    ? false
    : (state.orderEntryAccountReady ?? false);
  const orderEntryFunded = state.orderEntryRestricted
    ? false
    : (state.orderEntryFunded ?? false);

  const isRequestedSymbolUnavailable =
    state.requestedSymbol != null &&
    state.selectedRow?.symbol !== state.requestedSymbol;
  const marketName = isRequestedSymbolUnavailable
    ? (state.requestedSymbol ?? t("prediction.title"))
    : state.market
      ? formatPredictionMarketName(state.market)
      : t("prediction.title");
  const marketSelector = (
    <DropDownMarketsWidget
      {...marketsDropdown}
      tabs={
        state.onNavigatePerp
          ? marketsDropdown.tabs
          : marketsDropdown.tabs?.filter(
              (tab) => "id" in tab && tab.id === "prediction",
            )
      }
      contentClassName={
        isMobile
          ? "oui-h-[560px] oui-w-[920px] oui-max-w-[calc(100vw-24px)]"
          : undefined
      }
      symbol={
        isRequestedSymbolUnavailable
          ? undefined
          : state.market?.indexPriceSymbol
      }
      onSymbolChange={state.onNavigatePerp}
    >
      <button
        type="button"
        disabled={!state.onSelectSymbol && !state.onNavigatePerp}
        className="oui-flex oui-min-w-0 oui-items-center oui-gap-3 oui-text-start 2xl:oui-w-[340px] 2xl:oui-shrink-0"
      >
        {!isRequestedSymbolUnavailable && state.market && (
          <TokenIcon name={state.market.base} size="lg" />
        )}
        <div className="oui-min-w-0 oui-flex-1">
          <h1 className="oui-flex oui-items-center oui-gap-1 oui-truncate oui-text-base oui-font-semibold oui-text-base-contrast">
            <span className="oui-truncate">{marketName}</span>
            <TriangleDownIcon className="oui-flex-none oui-text-base-contrast-54" />
          </h1>
          {!isRequestedSymbolUnavailable && state.market && (
            <div className="oui-text-xs oui-mt-0.5 oui-truncate oui-font-normal oui-text-base-contrast-54">
              {formatRoundWindow(
                state.selectedRow?.observation_start_at != null
                  ? state.selectedRow.observation_start_at / 1_000
                  : state.selectedRound,
                state.market.intervalSeconds,
                state.selectedRow?.expire_at,
              )}
            </div>
          )}
        </div>
      </button>
    </DropDownMarketsWidget>
  );
  if (!state.isRoundsReady || isRequestedSymbolUnavailable) {
    return (
      <main
        id="oui-prediction-page"
        className="oui-flex oui-min-h-[calc(100vh-64px)] oui-flex-col oui-gap-3 oui-bg-base-10 oui-p-3 lg:oui-p-4"
      >
        <header className="oui-flex oui-items-center oui-rounded-2xl oui-bg-base-9 oui-p-4">
          {marketSelector}
        </header>
        <div
          role="status"
          className="oui-prediction-emptyState oui-flex oui-min-h-[320px] oui-flex-1 oui-flex-col oui-items-center oui-justify-center oui-rounded-2xl oui-bg-base-9 oui-px-6 oui-py-12 sm:oui-min-h-[400px]"
        >
          {state.isRoundsLoading ? (
            <Spinner size="lg" color="primary" />
          ) : (
            <>
              <p className="oui-text-sm oui-max-w-sm oui-text-center oui-font-normal oui-leading-relaxed oui-text-base-contrast-54">
                {t("prediction.rounds.unavailable")}
              </p>
            </>
          )}
        </div>
      </main>
    );
  }

  return (
    <main
      id="oui-prediction-page"
      className="oui-min-h-[calc(100vh-64px)] oui-bg-base-10 oui-p-3 oui-font-semibold lg:oui-p-4"
    >
      {/* Order book | trade sit side-by-side below 2xl with the same 4fr/6fr
          split as the perps mobile page (orderBookAndEntry). 2xl is the
          theme's 1280px screen and must match isDesktopLayout below. */}
      <div className="oui-grid oui-grid-cols-[4fr_6fr] oui-items-stretch oui-gap-3 2xl:oui-grid-cols-[minmax(0,1fr)_280px_280px] 2xl:oui-grid-rows-[auto_auto_auto]">
        <header className="oui-col-span-2 oui-col-start-1 oui-row-start-1 oui-flex oui-flex-col oui-gap-4 oui-rounded-2xl oui-bg-base-9 oui-p-4 2xl:oui-col-span-1 2xl:oui-col-start-1 2xl:oui-row-start-1 2xl:oui-flex-row 2xl:oui-items-center">
          {marketSelector}

          <div className="oui-hidden oui-h-12 oui-w-px oui-flex-shrink-0 oui-bg-line-12 2xl:oui-block" />

          <div className="oui-hidden oui-min-w-0 oui-flex-1 oui-grid-cols-2 oui-items-center oui-gap-x-6 oui-gap-y-3 sm:oui-grid-cols-3 2xl:oui-flex 2xl:oui-grid 2xl:oui-flex-wrap 2xl:oui-gap-x-8">
            <DataItem
              label={t("prediction.chart.indexPrice", {
                base: state.market?.base ?? "",
              })}
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

        <div className="oui-col-span-2 oui-col-start-1 oui-row-start-2 oui-min-w-0 2xl:oui-col-span-1 2xl:oui-col-start-1 2xl:oui-row-start-2">
          {/* Keep a single chart and leaf clock mounted per breakpoint. */}
          {isDesktopLayout ? (
            <PriceChart
              key={state.marketId}
              intervalSeconds={state.market?.intervalSeconds ?? 300}
              base={state.market?.base ?? ""}
              selectedRound={state.selectedRound}
              onSelectRound={state.selectMarketRound}
              points={state.priceHistory}
              candles={state.candles}
              roundOutcome={state.roundOutcomeLookup}
              selectedRow={state.selectedRow}
              rows={state.marketRows}
              currentPrice={state.chartIndexPrice}
              round={state.round}
              onGoToLiveMarket={state.goToLiveRound}
            />
          ) : (
            <MobileMarketPanel {...state} />
          )}
        </div>
        <div className="oui-col-start-1 oui-row-start-3 oui-min-w-0 2xl:oui-col-start-2 2xl:oui-row-span-2 2xl:oui-row-start-1">
          <PredictionOrderBook
            selectedRow={state.selectedRow}
            market={state.market}
            orderBook={state.orderBook}
            selectedOutcome={state.selectedOutcome}
            markPrice={state.markPrice}
            setLimitPrice={state.setLimitPrice}
            setOrderType={state.setOrderType}
            isRoundTradable={state.isRoundTradable}
            roundPhase={state.roundPhase}
          />
        </div>
        <div
          className={cn(
            "oui-col-start-2 oui-row-start-3 oui-space-y-3 2xl:oui-col-start-3 2xl:oui-row-span-3 2xl:oui-row-start-1",
            (state.isRegionRestricted || state.orderEntryRestricted) &&
              "oui-flex oui-flex-col oui-self-stretch 2xl:oui-block",
          )}
        >
          {/* Desktop-only: mobile trading uses the header AuthGuard instead. */}
          {state.accountPanel && !isMobile && (
            <div className="oui-rounded-2xl oui-border oui-border-line-12 oui-bg-base-9 oui-p-3">
              {state.accountPanel}
            </div>
          )}
          {state.isRegionRestricted || state.orderEntryRestricted ? (
            <RoundOrderStatusCard
              marketName={marketName}
              intervalSeconds={state.market?.intervalSeconds ?? 300}
              round={state.selectedRound}
              roundPhase={state.roundPhase}
              isRoundInSnapshot={state.isRoundInSnapshot}
              restricted
            />
          ) : state.isRoundTradable ? (
            <TradePanel
              {...state}
              orderEntryAccountReady={orderEntryAccountReady}
              orderEntryFunded={orderEntryFunded}
            />
          ) : (
            <RoundResultWidget
              state={state}
              marketName={marketName}
              intervalSeconds={state.market?.intervalSeconds ?? 300}
            />
          )}
        </div>
        <div className="oui-col-span-2 oui-col-start-1 oui-row-start-4 oui-min-h-0 oui-min-w-0 lg:oui-h-[min(800px,max(420px,42vh))] lg:oui-overflow-hidden 2xl:oui-row-start-3">
          <PredictionAccountPanel
            activeTab={state.activeTab}
            setActiveTab={state.setActiveTab}
            marketView={panelMarketView}
            isSubmitting={state.isSubmitting}
            isRegionRestricted={state.isRegionRestricted}
          />
        </div>
      </div>
    </main>
  );
};
