import React, { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  builtInTabs,
  FavoritesIcon2,
  UnFavoritesIcon2,
  useMarketsContext,
} from "@orderly.network/markets";
import type { MarketTabConfig } from "@orderly.network/markets";
import { cn, DataTable, Text, TokenIcon } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import type { PredictionState } from "./prediction.script";
import {
  PREDICTION_MARKET_ID,
  PREDICTION_MARKET_VOLUME,
} from "./predictionMockData.script";
import {
  formatContractPrice,
  formatCountdown,
  formatPercent,
  toIntlLocale,
  usePredictionFormatters,
} from "./predictionShared";

const predictionMarketTab: MarketTabConfig = {
  id: "prediction",
  name: "Prediction",
  match: () => false,
};

export const predictionMarketTabs: MarketTabConfig[] = [
  builtInTabs.favorites,
  builtInTabs.all,
  builtInTabs.crypto,
  predictionMarketTab,
  builtInTabs.rwa,
  builtInTabs.community,
  builtInTabs.newListing,
  builtInTabs.recent,
  builtInTabs.preTge,
];

export type PredictionMarketRowProps = Pick<
  PredictionState,
  "countdown" | "isRoundTradable" | "outcomePrices" | "round" | "upChance"
> & {
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onSelect: () => void;
  showFavoriteControl?: boolean;
};

export const PredictionMarketPanel: React.FC<
  PredictionMarketRowProps & { className?: string }
> = ({ className, ...props }) => {
  const { t } = useTranslation();
  const { locale } = usePredictionFormatters();
  const { searchValue } = useMarketsContext();
  const searchableText = `${t("prediction.btcUpDown")} BTC UP DOWN 5M`;
  const matchesSearch =
    !searchValue ||
    searchableText.toLowerCase().includes(searchValue.trim().toLowerCase());

  type PredictionMarketRecord = {
    symbol: string;
    chance: number;
    lastPrice: number;
    volume: number;
    time: string;
  };

  const columns = useMemo<Column<PredictionMarketRecord>[]>(
    () => [
      {
        title: t("common.symbol"),
        dataIndex: "symbol",
        width: 190,
        onSort: true,
        render: () => (
          <div className="oui-flex oui-min-w-0 oui-items-center oui-gap-2">
            {props.showFavoriteControl !== false && (
              <button
                type="button"
                aria-label={t("markets.favorites")}
                onClick={(event) => {
                  event.stopPropagation();
                  props.onToggleFavorite();
                }}
                className="oui-prediction-market-favorite-btn oui-me-1 oui-flex oui-size-3 oui-flex-none oui-cursor-pointer oui-items-center oui-justify-center"
              >
                {props.isFavorite ? (
                  <FavoritesIcon2 className="oui-size-3" />
                ) : (
                  <UnFavoritesIcon2 className="oui-size-3" />
                )}
              </button>
            )}
            <TokenIcon name="BTC" className="oui-size-[18px]" />
            <Text
              size="2xs"
              className="oui-whitespace-nowrap oui-text-base-contrast"
            >
              {t("prediction.btcUpDown")}
            </Text>
          </div>
        ),
      },
      {
        title: t("markets.column.last"),
        dataIndex: "lastPrice",
        width: 100,
        align: "right",
        onSort: true,
        render: (value) => <Text size="2xs">{formatContractPrice(value)}</Text>,
      },
      {
        title: t("prediction.chance"),
        dataIndex: "chance",
        width: 80,
        align: "right",
        onSort: true,
        render: (value) => <Text size="2xs">{formatPercent(value)}</Text>,
      },
      {
        title: t("prediction.volumeShort"),
        dataIndex: "volume",
        width: 80,
        align: "right",
        onSort: true,
        render: (value) => (
          <Text size="2xs">${value.toLocaleString(toIntlLocale(locale))}</Text>
        ),
      },
      {
        title: t("common.time"),
        dataIndex: "time",
        width: 80,
        align: "right",
        onSort: true,
        render: (value) => <Text size="2xs">{value}</Text>,
      },
    ],
    [locale, props.isFavorite, props.onToggleFavorite, props.round, t],
  );

  const dataSource: PredictionMarketRecord[] = matchesSearch
    ? [
        {
          symbol: PREDICTION_MARKET_ID,
          chance: props.upChance,
          lastPrice: props.outcomePrices.up,
          volume: PREDICTION_MARKET_VOLUME,
          time: props.isRoundTradable
            ? formatCountdown(props.countdown)
            : "00:00",
        },
      ]
    : [];

  return (
    <div
      className={cn(
        "oui-relative oui-z-[3] oui-overflow-hidden oui-bg-base-8 oui-px-1 oui-pb-2",
        className,
      )}
    >
      <DataTable
        columns={columns}
        dataSource={dataSource}
        generatedRowKey={(record) => record.symbol}
        classNames={{
          root: "!oui-h-auto !oui-bg-base-8",
          scroll: "!oui-h-auto !oui-min-h-0",
          header: "oui-h-9",
        }}
        onRow={() => ({
          className: "oui-prediction-market-row !oui-h-[34px]",
          onClick: props.onSelect,
        })}
      />
    </div>
  );
};
