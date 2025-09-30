import { MouseEventHandler, ReactNode } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  Flex,
  TokenIcon,
  Text,
  Badge,
  cn,
  Column,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  DeleteIcon,
  FavoritesIcon2,
  TopIcon,
  UnFavoritesIcon2,
} from "../../icons";
import type { FavoriteInstance } from "../../type";
import { FavoritesDropdownMenuWidget } from "../favoritesDropdownMenu";
import { RwaDotTooltip } from "../rwaDotTooltip";

export const useSideMarketsColumns = (
  favorite: FavoriteInstance,
  isFavoriteList = false,
) => {
  const { t } = useTranslation();

  return [
    {
      title: `${t("markets.column.market")} / ${t("common.volume")}`,
      dataIndex: "24h_amount",
      multiSort: {
        fields: [
          {
            sortKey: "symbol",
            label: t("markets.column.market"),
          },
          {
            sortKey: "24h_amount",
            label: t("common.volume"),
          },
        ],
      },
      className: "oui-h-[36px]",
      render: (value, record) => {
        let favoritesIcon: ReactNode;
        if (!isFavoriteList) {
          favoritesIcon = (
            <FavoritesDropdownMenuWidget row={record} favorite={favorite}>
              <Flex
                width={12}
                height={12}
                justify="center"
                itemAlign="center"
                className="oui-mr-1 oui-cursor-pointer"
              >
                {record.isFavorite ? (
                  <FavoritesIcon2 className="oui-size-3 oui-text-[rgba(255,154,46,1)]" />
                ) : (
                  <UnFavoritesIcon2 className="oui-size-3 oui-text-base-contrast-36 hover:oui-text-[rgba(255,154,46,1)]" />
                )}
              </Flex>
            </FavoritesDropdownMenuWidget>
          );
        }

        return (
          <Flex>
            {favoritesIcon}
            <Flex direction="column" itemAlign="start" gapY={1}>
              <Flex gapX={1}>
                <TokenIcon symbol={record.symbol} className="oui-size-[18px]" />
                <Text.formatted
                  rule="symbol"
                  formatString="base"
                  size="2xs"
                  weight="semibold"
                >
                  {record.symbol}
                </Text.formatted>
                <RwaDotTooltip record={record} />
                <Badge size="xs" color="primary">
                  {record.leverage}x
                </Badge>
              </Flex>

              <Text.numeral
                intensity={54}
                size="2xs"
                rule="human"
                dp={2}
                rm={Decimal.ROUND_DOWN}
              >
                {value}
              </Text.numeral>
            </Flex>
          </Flex>
        );
      },
    },
    {
      title: t("markets.column.price&Change"),
      dataIndex: "change",
      align: "right",
      onSort: true,
      className: "oui-h-[36px]",
      render: (value, record) => {
        const onDelSymbol: MouseEventHandler = (e) => {
          favorite.updateSymbolFavoriteState(
            record,
            favorite.selectedFavoriteTab,
            true,
          );
          e.stopPropagation();
        };

        const iconCls =
          "oui-w-4 oui-h-4 oui-text-base-contrast-54 hover:oui-text-base-contrast";

        const actions = (
          <div
            className={cn(
              "oui-absolute oui-right-0 oui-top-[6.5px]",
              "oui-hidden group-hover:oui-block",
            )}
          >
            <Flex
              className={cn(
                "oui-inline-flex",
                "oui-bg-primary-darken oui-py-[6px]",
              )}
              r="base"
              width={52}
              justify="center"
              itemAlign="end"
              gapX={2}
            >
              <TopIcon
                className={iconCls}
                onClick={(e) => {
                  e.stopPropagation();
                  favorite.pinToTop(record);
                }}
              />
              <DeleteIcon className={iconCls} onClick={onDelSymbol} />
            </Flex>
          </div>
        );

        return (
          <div className="oui-relative">
            {isFavoriteList && actions}

            <Flex
              direction="column"
              justify="end"
              itemAlign="end"
              gapY={1}
              className={cn(isFavoriteList && "group-hover:oui-invisible")}
            >
              <Text.numeral dp={record.quote_dp || 2} size="2xs">
                {record["24h_close"]}
              </Text.numeral>
              <Text.numeral
                rule="percentages"
                coloring
                rm={Decimal.ROUND_DOWN}
                showIdentifier
                size="2xs"
              >
                {value}
              </Text.numeral>
            </Flex>
          </div>
        );
      },
    },
  ] as Column[];
};
