import { MouseEventHandler, ReactNode } from "react";
import { i18n } from "@orderly.network/i18n";
import { Flex, TokenIcon, Text, Badge, cn, Column } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  DeleteIcon,
  FavoritesIcon2,
  TopIcon,
  UnFavoritesIcon2,
} from "../../icons";
import { FavoriteInstance } from "../../type";
import { FavoritesDropdownMenuWidget } from "../favoritesDropdownMenu";
import { RwaDotTooltip } from "../rwaDotTooltip";
import { SymbolDisplay } from "../symbolDisplay";

export const getMarketsSheetColumns = (
  favorite: FavoriteInstance,
  isFavoriteList = false,
) => {
  return [
    {
      title: i18n.t("common.symbol"),
      dataIndex: "symbol",
      align: "left",
      onSort: true,
      className: "oui-h-[36px]",
      width: 124,
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
                  <FavoritesIcon2 className="oui-size-3" />
                ) : (
                  <UnFavoritesIcon2 className="oui-size-3" />
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
                <SymbolDisplay formatString="base" size="2xs">
                  {record.symbol}
                </SymbolDisplay>
                <RwaDotTooltip record={record} />
              </Flex>
              <Badge size="xs" color="primary">
                {record.leverage}x
              </Badge>
            </Flex>
          </Flex>
        );
      },
    },
    {
      title: i18n.t("markets.column.24hVolOI"),
      dataIndex: "24h_amount",
      align: "right",
      className: "oui-h-[36px]",
      width: 100,
      multiSort: {
        fields: [
          {
            sortKey: "24h_amount",
            label: i18n.t("markets.column.24hVol"),
          },
          {
            sortKey: "openInterest",
            label: i18n.t("markets.column.OI"),
          },
        ],
      },
      render: (value, record) => (
        <Flex direction="column" itemAlign="end" gapY={1}>
          <Text.numeral rule="human" dp={2} rm={Decimal.ROUND_DOWN}>
            {value}
          </Text.numeral>
          <Text.numeral
            rule="human"
            dp={2}
            rm={Decimal.ROUND_DOWN}
            size="2xs"
            intensity={54}
          >
            {record.openInterest}
          </Text.numeral>
        </Flex>
      ),
    },
    {
      title: i18n.t("markets.column.last&24hPercentage"),
      dataIndex: "change",
      align: "right",
      onSort: true,
      className: "oui-h-[36px]",
      width: 100,
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
