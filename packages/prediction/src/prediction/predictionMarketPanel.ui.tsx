import React, { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  FavoritesIcon2,
  UnFavoritesIcon2,
  useMarketCategories,
  useMarketsContext,
} from "@orderly.network/markets-core";
import type {
  MarketCategoryComponentKey,
  MarketTabConfig,
} from "@orderly.network/markets-core";
import { useFeatureEnabled } from "@orderly.network/react-app";
import { cn, Spinner, Text, TokenIcon } from "@orderly.network/ui";
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
  /** 3-column two-line layout for narrow containers (side panel, mobile sheets). */
  compact?: boolean;
};

const PredictionMarketRowImpl: React.FC<PredictionMarketRowProps> = ({
  market,
  bbo,
  volume,
  favorite,
  onToggleFavorite,
  onSelect,
  compact,
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
  const symbolCell = (
    <div className="oui-flex oui-items-center oui-gap-2">
      <button
        type="button"
        aria-label={t("markets.favorites")}
        onClick={(event) => {
          event.stopPropagation();
          onToggleFavorite(market.id);
        }}
        className="oui-flex oui-size-4 oui-flex-none oui-items-center oui-justify-center"
      >
        {favorite ? <FavoritesIcon2 /> : <UnFavoritesIcon2 />}
      </button>
      <TokenIcon name={market.base} className="oui-size-[18px]" />
      <Text size="2xs" className="oui-whitespace-nowrap oui-text-base-contrast">
        {formatPredictionMarketName(market)}
      </Text>
    </div>
  );
  const rowClassName = cn(
    "oui-prediction-market-row",
    onSelect && "oui-cursor-pointer hover:oui-bg-base-7",
    !market.hasLiveRow && "oui-opacity-60",
  );

  if (compact) {
    return (
      <tr
        className={rowClassName}
        aria-disabled={!onSelect}
        onClick={
          onSelect ? () => onSelect(market.currentRow.symbol) : undefined
        }
      >
        <td className="oui-px-2 oui-py-1.5 oui-text-start oui-align-middle">
          {symbolCell}
        </td>
        <td className="oui-px-2 oui-py-1.5 oui-text-end oui-align-middle">
          <div className="oui-text-xs oui-leading-4">{lastPrice}</div>
          <div className="oui-text-2xs oui-leading-4">{chance}</div>
        </td>
        <td className="oui-px-2 oui-py-1.5 oui-text-end oui-align-middle">
          <div className="oui-text-xs oui-leading-4">{countdown}</div>
          <div className="oui-text-2xs oui-leading-4">{volumeCell}</div>
        </td>
      </tr>
    );
  }

  return (
    <tr
      className={cn(rowClassName, "oui-h-[34px]")}
      aria-disabled={!onSelect}
      onClick={onSelect ? () => onSelect(market.currentRow.symbol) : undefined}
    >
      <td className="oui-px-2 oui-text-start">{symbolCell}</td>
      <td className="oui-text-xs oui-px-2 oui-text-end">{lastPrice}</td>
      <td className="oui-text-xs oui-px-2 oui-text-end">{chance}</td>
      <td className="oui-text-xs oui-px-2 oui-text-end">{volumeCell}</td>
      <td className="oui-text-xs oui-px-2 oui-text-end">{countdown}</td>
    </tr>
  );
};

// Memoized so a BBO push on one market only re-renders that row: `market`
// identities stay stable between round-boundary clock jumps, and the BBO map
// update preserves untouched symbols' object identities.
const PredictionMarketRow = React.memo(PredictionMarketRowImpl);

/** Below this container width the panel switches to the compact 3-column layout. */
const PREDICTION_COMPACT_PANEL_WIDTH = 460;

/**
 * Narrow containers (side panel, mobile sheets) cannot fit the 5-column row.
 * Observe the panel width and fall back to a 3-column two-line layout that
 * mirrors the perps side-list rows. Environments without ResizeObserver
 * (tests, SSR) keep the default layout.
 */
const useCompactPanelWidth = () => {
  const [compact, setCompact] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(([entry]) => {
      setCompact(entry.contentRect.width < PREDICTION_COMPACT_PANEL_WIDTH);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  return { ref, compact };
};

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
}) => {
  const { t } = useTranslation();
  const { searchValue } = useMarketsContext();
  const { ref, compact } = useCompactPanelWidth();
  const visibleMarkets = filterPredictionMarkets(markets, searchValue);

  if (visibleMarkets.length === 0) {
    return (
      <div
        ref={ref}
        className={cn(
          "oui-flex oui-h-full oui-items-center oui-justify-center oui-bg-base-8",
          className,
        )}
      >
        {loading ? (
          <Spinner />
        ) : (
          <Text intensity={54} size="sm">
            {t("ui.empty.description")}
          </Text>
        )}
      </div>
    );
  }

  return (
    <div
      ref={ref}
      className={cn(
        "oui-custom-scrollbar oui-h-full oui-overflow-auto oui-bg-base-8 oui-px-1",
        className,
      )}
    >
      <table className="oui-w-full oui-table-fixed oui-text-base-contrast">
        {compact ? (
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
        <thead className="oui-text-xs oui-sticky oui-top-0 oui-z-10 oui-bg-base-8 oui-text-base-contrast-36">
          <tr className="oui-h-9">
            <th className="oui-px-2 oui-text-start">{t("common.symbol")}</th>
            {compact ? (
              <>
                {/* Combined single-line headers, perps `Last/24h %` style. */}
                <th className="oui-px-2 oui-text-end oui-whitespace-nowrap">
                  {t("prediction.column.last&probability")}
                </th>
                <th className="oui-px-2 oui-text-end oui-whitespace-nowrap">
                  {t("prediction.column.time&volume")}
                </th>
              </>
            ) : (
              <>
                <th className="oui-px-2 oui-text-end">
                  {t("markets.column.last")}
                </th>
                <th className="oui-px-2 oui-text-end">
                  {t("prediction.probability")}
                </th>
                <th className="oui-px-2 oui-text-end">
                  {t("prediction.volumeShort")}
                </th>
                <th className="oui-px-2 oui-text-end">{t("common.time")}</th>
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
