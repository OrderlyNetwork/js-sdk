import React, { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  FavoritesIcon,
  FavoritesIcon2,
  UnFavoritesIcon,
  UnFavoritesIcon2,
  useMarketCategories,
  useMarketsContext,
} from "@orderly.network/markets-core";
import type {
  MarketCategoryComponentKey,
  MarketTabConfig,
} from "@orderly.network/markets-core";
import { useFeatureEnabled } from "@orderly.network/react-app";
import {
  cn,
  InjectableEmptyDataState,
  Spinner,
  Text,
  TokenIcon,
  useScreen,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import type { BinaryMarket } from "./binary/binaryMarkets";
import { DEFAULT_BINARY_QUOTE_TICK } from "./binary/binaryOrderRules";
import type { BinaryBbo } from "./binary/useBinaryBbo";
import { useBinaryBboMap } from "./binary/useBinaryBbo";
import { useBinaryTickerAmounts } from "./binary/useBinaryTickerAmounts";
import { useRoundCountdown } from "./hooks/useRoundCountdown";
import {
  filterPredictionMarkets,
  formatPredictionMarketName,
} from "./predictionMarketSearch";
import { formatCountdown, formatPercent } from "./predictionShared";

const predictionMarketTab = (name: string): MarketTabConfig => ({
  id: "prediction",
  name,
  match: () => false,
});

export const usePredictionMarketTabs = (
  componentKey: MarketCategoryComponentKey = "dropDownMarkets",
): MarketTabConfig[] => {
  const { t } = useTranslation();
  const defaultTabs = useMarketCategories(componentKey);
  const predictionEnabled = useFeatureEnabled("prediction");
  return useMemo(() => {
    const tabs = defaultTabs.filter(
      (tab) => !("id" in tab && tab.id === "prediction"),
    );
    if (!predictionEnabled) return tabs;
    const cryptoIndex = tabs.findIndex(
      (tab) => "type" in tab && tab.type === "crypto",
    );
    tabs.splice(cryptoIndex + 1, 0, predictionMarketTab(t("common.predict")));
    return tabs;
  }, [defaultTabs, t, predictionEnabled]);
};

type PredictionMarketRowProps = {
  market: BinaryMarket;
  /** Live UP-coordinate BBO from the panel's @bbo subscriptions. */
  bbo: BinaryBbo | undefined;
  /** 24h quote amount (USDC notional) of the round symbol; a fresh symbol starts at zero, so this is effectively the round's cumulative volume. */
  volume: number | undefined;
  favorite: boolean;
  onToggleFavorite: (symbol: string) => void;
  onSelect?: (symbol: string) => void;
  /** Three-column two-line layout used by side panels, sheets and the mobile markets page. */
  compact?: boolean;
  selected: boolean;
  rowHeightClassName: string;
  desktopMarketsPage: boolean;
};

const PredictionMarketRowImpl: React.FC<PredictionMarketRowProps> = ({
  market,
  bbo,
  volume,
  favorite,
  onToggleFavorite,
  onSelect,
  compact,
  selected,
  rowHeightClassName,
  desktopMarketsPage,
}) => {
  const { t } = useTranslation();
  // Shared heartbeat tick: rows update their own countdown each second
  // without re-rendering the whole panel.
  const seconds = useRoundCountdown(market.currentRow.expire_at);
  // Mid = UP win probability; both sides must be present to derive it.
  const price =
    bbo?.bestBid != null && bbo?.bestAsk != null
      ? new Decimal(bbo.bestBid).add(bbo.bestAsk).div(2).toNumber()
      : undefined;
  const lastPrice =
    price == null
      ? "--"
      : price.toFixed(
          new Decimal(
            market.currentRow.quote_tick ?? DEFAULT_BINARY_QUOTE_TICK,
          ).decimalPlaces(),
        );
  // Chance derives from the tick-rounded last price so both cells read as the
  // same number; a half-tick mid like 0.505 would otherwise split into
  // Last 0.51 vs Chance 50.5%.
  const chance =
    price == null
      ? "--"
      : formatPercent(new Decimal(lastPrice).mul(100).toNumber());
  const countdown = market.hasLiveRow
    ? formatCountdown(seconds)
    : t("prediction.closed");
  // Same humanized convention as the perps 24h Vol column.
  const volumeCell =
    volume == null ? (
      "--"
    ) : (
      <Text.numeral rule="human" dp={2} rm={Decimal.ROUND_DOWN}>
        {volume}
      </Text.numeral>
    );
  const favoriteButton = (
    <button
      type="button"
      aria-label={t("markets.favorites")}
      onClick={(event) => {
        event.stopPropagation();
        onToggleFavorite(market.id);
      }}
      className={cn(
        "oui-flex oui-items-center oui-justify-center",
        desktopMarketsPage
          ? "oui-size-full"
          : "oui-me-1 oui-size-3 oui-flex-none",
      )}
    >
      {desktopMarketsPage ? (
        favorite ? (
          <FavoritesIcon />
        ) : (
          <UnFavoritesIcon />
        )
      ) : favorite ? (
        <FavoritesIcon2 className="oui-size-3" />
      ) : (
        <UnFavoritesIcon2 className="oui-size-3" />
      )}
    </button>
  );
  const symbolCell = (
    <div className="oui-flex oui-items-center oui-gap-1">
      {!desktopMarketsPage && favoriteButton}
      <TokenIcon name={market.base} className="oui-size-[18px]" />
      <Text
        size={desktopMarketsPage ? "xs" : "2xs"}
        className="oui-whitespace-nowrap"
      >
        {formatPredictionMarketName(market)}
      </Text>
    </div>
  );
  const rowClassName = cn(
    "oui-prediction-market-row",
    rowHeightClassName,
    desktopMarketsPage && "oui-border-b oui-border-b-line-4",
    desktopMarketsPage && "[&>td:first-child]:!oui-ps-1",
    "[&>td:first-child]:oui-ps-3 [&>td:last-child]:oui-pe-3 [&>td]:oui-px-1",
    "[&>td:first-child]:oui-rounded-s [&>td:last-child]:oui-rounded-e",
    selected ? "[&>td]:oui-bg-line-6" : "[&:hover>td]:oui-bg-line-4",
    onSelect && "oui-cursor-pointer",
  );

  const priceClassName = cn(
    "oui-text-end",
    desktopMarketsPage ? "oui-text-xs" : "oui-text-2xs",
  );

  if (compact) {
    return (
      <tr
        className={rowClassName}
        aria-selected={selected}
        aria-disabled={!onSelect}
        onClick={
          onSelect ? () => onSelect(market.currentRow.symbol) : undefined
        }
      >
        <td className="oui-text-start oui-align-middle">{symbolCell}</td>
        <td className="oui-text-end oui-align-middle">
          <div className="oui-flex oui-flex-col oui-items-end oui-gap-1">
            <Text size="2xs">{lastPrice}</Text>
            <Text size="2xs">{chance}</Text>
          </div>
        </td>
        <td className="oui-text-end oui-align-middle">
          <div className="oui-flex oui-flex-col oui-items-end oui-gap-1">
            <Text size="2xs" intensity={market.hasLiveRow ? undefined : 54}>
              {countdown}
            </Text>
            <Text size="2xs" intensity={54}>
              {volumeCell}
            </Text>
          </div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={rowClassName}
      aria-selected={selected}
      aria-disabled={!onSelect}
      onClick={onSelect ? () => onSelect(market.currentRow.symbol) : undefined}
    >
      {desktopMarketsPage && (
        <td className="oui-text-center">{favoriteButton}</td>
      )}
      <td className="oui-text-start">{symbolCell}</td>
      <td className={priceClassName}>{lastPrice}</td>
      <td className={priceClassName}>{chance}</td>
      <td className="oui-text-xs oui-text-end">{volumeCell}</td>
      <td className={priceClassName}>
        <Text intensity={market.hasLiveRow ? undefined : 54}>{countdown}</Text>
      </td>
    </tr>
  );
};

// Memoized so a BBO push on one market only re-renders that row: `market`
// identities stay stable between round-boundary clock jumps, and the BBO map
// update preserves untouched symbols' object identities.
const PredictionMarketRow = React.memo(PredictionMarketRowImpl);

export type PredictionMarketPanelProps = {
  markets: BinaryMarket[];
  /** Live BBO per round symbol (supplied by PredictionMarketPanelWidget). */
  bbos: Record<string, BinaryBbo>;
  /** 24h quote amounts per round symbol (supplied by PredictionMarketPanelWidget). */
  volumes?: Record<string, number>;
  loading?: boolean;
  favoriteMarketIds: string[];
  onToggleFavorite: (symbol: string) => void;
  onSelect?: (symbol: string) => void;
  className?: string;
  /** Match the surrounding market list, including its sticky header and empty states. */
  background?: "base-8" | "base-9";
  /** Host surface controls list density, empty-state placement and safe-area padding. */
  componentKey?: MarketCategoryComponentKey;
  /** Desktop favorites use the default 40px table header rather than the 48px markets header. */
  favoritesSection?: boolean;
};

export const PredictionMarketPanel: React.FC<PredictionMarketPanelProps> = ({
  markets,
  bbos,
  volumes = {},
  loading,
  favoriteMarketIds,
  onToggleFavorite,
  onSelect,
  className,
  background = "base-8",
  componentKey = "dropDownMarkets",
  favoritesSection = false,
}) => {
  const { t } = useTranslation();
  const { searchValue, symbol } = useMarketsContext();
  const { isMobile } = useScreen();
  const visibleMarkets = filterPredictionMarkets(markets, searchValue);
  const backgroundClassName =
    background === "base-9" ? "oui-bg-base-9" : "oui-bg-base-8";

  const isMarketsPage = componentKey === "marketsDataList";
  const isDesktopMarketsPage = isMarketsPage && !isMobile;
  const compact =
    componentKey === "expandMarkets" ||
    componentKey === "marketsSheet" ||
    (isMarketsPage && isMobile);
  const rowHeightClassName = isMarketsPage
    ? isMobile
      ? "oui-h-[54px]"
      : "oui-h-[55px]"
    : componentKey === "dropDownMarkets"
      ? "oui-h-[34px]"
      : "oui-h-[53px]";
  const safeAreaClassName =
    (isMobile || componentKey === "marketsSheet") &&
    "oui-pb-[env(safe-area-inset-bottom,_20px)]";

  if (visibleMarkets.length === 0) {
    return (
      <div
        className={cn(
          "oui-flex oui-h-full oui-min-h-[162px] oui-justify-center",
          isDesktopMarketsPage
            ? "oui-items-center"
            : "oui-items-start oui-pt-6",
          safeAreaClassName,
          backgroundClassName,
          className,
        )}
      >
        {loading ? <Spinner /> : <InjectableEmptyDataState />}
      </div>
    );
  }

  return (
    <div
      className={cn(
        "oui-text-xs oui-custom-scrollbar oui-h-full oui-min-h-[162px] oui-overflow-auto oui-font-semibold",
        // Match the desktop market table's leading inset.
        isDesktopMarketsPage && "oui-box-border oui-ps-[7px]",
        (componentKey === "dropDownMarkets" ||
          componentKey === "expandMarkets") &&
          "oui-px-1",
        !safeAreaClassName && componentKey === "dropDownMarkets" && "oui-pb-5",
        !safeAreaClassName && componentKey === "expandMarkets" && "oui-pb-2",
        safeAreaClassName,
        backgroundClassName,
        className,
      )}
    >
      <table
        className={cn(
          "oui-w-full oui-table-fixed oui-text-base-contrast-80",
          isDesktopMarketsPage && "oui-border-collapse",
        )}
      >
        {isDesktopMarketsPage ? (
          <colgroup>
            {/* Match the numeric column widths used by the desktop market table. */}
            <col className="oui-w-[30px]" />
            <col className="oui-w-[120px]" />
            <col className="oui-w-[100px]" />
            <col className="oui-w-[100px]" />
            <col className="oui-w-[100px]" />
            <col className="oui-w-[100px]" />
          </colgroup>
        ) : compact ? (
          <colgroup>
            <col className="oui-w-[45%]" />
            <col className="oui-w-[28%]" />
            <col className="oui-w-[27%]" />
          </colgroup>
        ) : (
          <colgroup>
            <col className="oui-w-[34%]" />
            <col className="oui-w-[16%]" />
            <col className="oui-w-[16%]" />
            <col className="oui-w-[16%]" />
            <col className="oui-w-[18%]" />
          </colgroup>
        )}
        <thead
          className={cn(
            "oui-text-xs oui-sticky oui-top-0 oui-z-10 oui-text-base-contrast-36",
            backgroundClassName,
          )}
        >
          <tr
            className={cn(
              "[&>th:first-child]:oui-ps-3 [&>th:last-child]:oui-pe-3 [&>th]:oui-px-1",
              isDesktopMarketsPage
                ? favoritesSection
                  ? "oui-h-10"
                  : "oui-h-12"
                : "oui-h-9",
              isDesktopMarketsPage &&
                "[&>th:first-child]:!oui-ps-1 [&>th]:oui-border-b [&>th]:oui-border-line",
            )}
          >
            {isDesktopMarketsPage && (
              <th className="oui-text-center">
                <div className="oui-flex oui-w-full oui-items-center oui-justify-center">
                  <UnFavoritesIcon />
                </div>
              </th>
            )}
            <th className="oui-text-start">{t("common.symbol")}</th>
            {compact ? (
              <>
                {/* Combined single-line headers, perps `Last/24h %` style. */}
                <th className="oui-whitespace-nowrap oui-text-end">
                  {t("prediction.column.last&probability")}
                </th>
                <th className="oui-whitespace-nowrap oui-text-end">
                  {t("prediction.column.time&volume")}
                </th>
              </>
            ) : (
              <>
                <th className="oui-text-end">{t("markets.column.last")}</th>
                <th className="oui-text-end">{t("prediction.probability")}</th>
                <th className="oui-text-end">{t("prediction.volumeShort")}</th>
                <th className="oui-text-end">{t("common.time")}</th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {visibleMarkets.map((market) => (
            <PredictionMarketRow
              key={market.currentRow.symbol}
              market={market}
              bbo={bbos[market.currentRow.symbol]}
              volume={volumes[market.currentRow.symbol]}
              favorite={favoriteMarketIds.includes(market.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
              compact={compact}
              selected={symbol === market.currentRow.symbol}
              rowHeightClassName={rowHeightClassName}
              desktopMarketsPage={isDesktopMarketsPage}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Widget layer for the dropdown panel: owns the light `${symbol}@bbo` and
 * global `tickers` subscriptions while the panel itself stays pure
 * presentation. Mounts only while the dropdown tab is open, so the topics
 * live with its visibility.
 */
export const PredictionMarketPanelWidget: React.FC<
  Omit<PredictionMarketPanelProps, "bbos">
> = (props) => {
  // Only live rounds emit @bbo pushes; history-only markets render "--" prices
  // and skip the dead subscription.
  const symbols = useMemo(
    () =>
      props.markets
        .filter((market) => market.hasLiveRow)
        .map((market) => market.currentRow.symbol),
    [props.markets],
  );
  const bbos = useBinaryBboMap(symbols);
  const volumes = useBinaryTickerAmounts(symbols);
  return <PredictionMarketPanel {...props} bbos={bbos} volumes={volumes} />;
};
