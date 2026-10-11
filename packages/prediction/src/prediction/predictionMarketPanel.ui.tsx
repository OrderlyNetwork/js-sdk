import React, { useMemo } from "react";
import { i18n, useTranslation } from "@orderly.network/i18n";
import {
  FavoritesIcon2,
  UnFavoritesIcon2,
  useMarketCategories,
  useMarketsContext,
} from "@orderly.network/markets";
import type { MarketTabConfig } from "@orderly.network/markets";
import { cn, Spinner, Text, TokenIcon } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import type { BinaryMarket } from "./binary/binaryMarkets";
import { DEFAULT_BINARY_QUOTE_TICK } from "./binary/binaryOrderRules";
import type { BinaryBbo } from "./binary/useBinaryBbo";
import { useBinaryBboMap } from "./binary/useBinaryBbo";
import { useRoundCountdown } from "./hooks/useRoundCountdown";
import { formatCountdown, formatPercent } from "./predictionShared";

const predictionMarketTab = (name: string): MarketTabConfig => ({
  id: "prediction",
  name,
  match: () => false,
});

export const usePredictionMarketTabs = (): MarketTabConfig[] => {
  const { t } = useTranslation();
  const defaultTabs = useMarketCategories("dropDownMarkets");
  return useMemo(() => {
    const tabs = defaultTabs.filter(
      (tab) => !("id" in tab && tab.id === "prediction"),
    );
    const cryptoIndex = tabs.findIndex(
      (tab) => "type" in tab && tab.type === "crypto",
    );
    tabs.splice(cryptoIndex + 1, 0, predictionMarketTab(t("prediction.title")));
    return tabs;
  }, [defaultTabs, t]);
};

export const formatPredictionMarketName = (market: BinaryMarket) =>
  i18n.t("prediction.marketName", { base: market.base, period: market.period });

type PredictionMarketRowProps = {
  market: BinaryMarket;
  /** Live UP-coordinate BBO from the panel's @bbo subscriptions. */
  bbo: BinaryBbo | undefined;
  favorite: boolean;
  onToggleFavorite: (symbol: string) => void;
  onSelect?: (symbol: string) => void;
};

const PredictionMarketRowImpl: React.FC<PredictionMarketRowProps> = ({
  market,
  bbo,
  favorite,
  onToggleFavorite,
  onSelect,
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
  return (
    <tr
      className={cn(
        "oui-prediction-market-row oui-h-[34px]",
        onSelect && "oui-cursor-pointer hover:oui-bg-base-7",
        !market.hasLiveRow && "oui-opacity-60",
      )}
      aria-disabled={!onSelect}
      onClick={onSelect ? () => onSelect(market.currentRow.symbol) : undefined}
    >
      <td className="oui-px-2 oui-text-start">
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
          <Text
            size="2xs"
            className="oui-whitespace-nowrap oui-text-base-contrast"
          >
            {formatPredictionMarketName(market)}
          </Text>
        </div>
      </td>
      <td className="oui-text-xs oui-px-2 oui-text-end">
        {price == null
          ? "--"
          : price.toFixed(
              new Decimal(
                market.currentRow.quote_tick ?? DEFAULT_BINARY_QUOTE_TICK,
              ).decimalPlaces(),
            )}
      </td>
      <td className="oui-text-xs oui-px-2 oui-text-end">
        {price == null ? "--" : formatPercent(price * 100)}
      </td>
      <td className="oui-text-xs oui-px-2 oui-text-end">--</td>
      <td className="oui-text-xs oui-px-2 oui-text-end">
        {market.hasLiveRow ? formatCountdown(seconds) : t("prediction.closed")}
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
  loading?: boolean;
  favoriteMarketIds: string[];
  onToggleFavorite: (symbol: string) => void;
  onSelect?: (symbol: string) => void;
  className?: string;
};

export const PredictionMarketPanel: React.FC<PredictionMarketPanelProps> = ({
  markets,
  bbos,
  loading,
  favoriteMarketIds,
  onToggleFavorite,
  onSelect,
  className,
}) => {
  const { t } = useTranslation();
  const { searchValue } = useMarketsContext();
  const search = searchValue?.trim().toLowerCase() ?? "";
  const visibleMarkets = markets.filter((market) =>
    `${formatPredictionMarketName(market)} ${market.id} ${market.indexPriceSymbol}`
      .toLowerCase()
      .includes(search),
  );

  if (visibleMarkets.length === 0) {
    return (
      <div
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
      className={cn(
        "oui-h-full oui-overflow-auto oui-bg-base-8 oui-px-1",
        className,
      )}
    >
      <table className="oui-w-full oui-table-fixed oui-text-base-contrast">
        <colgroup>
          <col className="oui-w-[34%]" />
          <col className="oui-w-[16%]" />
          <col className="oui-w-[16%]" />
          <col className="oui-w-[16%]" />
          <col className="oui-w-[18%]" />
        </colgroup>
        <thead className="oui-text-xs oui-sticky oui-top-0 oui-z-10 oui-bg-base-8 oui-text-base-contrast-54">
          <tr className="oui-h-9">
            <th className="oui-px-2 oui-text-start">{t("common.symbol")}</th>
            <th className="oui-px-2 oui-text-end">
              {t("markets.column.last")}
            </th>
            <th className="oui-px-2 oui-text-end">{t("prediction.chance")}</th>
            <th className="oui-px-2 oui-text-end">
              {t("prediction.volumeShort")}
            </th>
            <th className="oui-px-2 oui-text-end">{t("common.time")}</th>
          </tr>
        </thead>
        <tbody>
          {visibleMarkets.map((market) => (
            <PredictionMarketRow
              key={market.currentRow.symbol}
              market={market}
              bbo={bbos[market.currentRow.symbol]}
              favorite={favoriteMarketIds.includes(market.id)}
              onToggleFavorite={onToggleFavorite}
              onSelect={onSelect}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * Widget layer for the dropdown panel: owns the light `${symbol}@bbo`
 * subscriptions while the panel itself stays pure presentation. Mounts only
 * while the dropdown tab is open, so the topics live with its visibility.
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
  return <PredictionMarketPanel {...props} bbos={bbos} />;
};
