import { ReactNode } from "react";
import { i18n } from "@veltodefi/i18n";
import { Text, Column, Flex, TokenIcon, Badge } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";
import { FavoritesIcon2, UnFavoritesIcon2 } from "../../icons";
import { FavoriteInstance } from "../../type";
import { FavoritesDropdownMenuWidget } from "../favoritesDropdownMenu";
import { RwaDotTooltip } from "../rwaDotTooltip";

export function getSymbolColumn(
  favorite: FavoriteInstance,
  isFavoriteList = false,
) {
  return {
    title: i18n.t("common.symbol"),
    dataIndex: "symbol",
    width: 150,
    onSort: true,
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
        <Flex gapX={1}>
          {favoritesIcon}
          <TokenIcon symbol={value} className="oui-size-[18px]" />
          <Text.formatted
            rule="symbol"
            formatString="base"
            size="2xs"
            weight="semibold"
          >
            {value}
          </Text.formatted>
          <RwaDotTooltip record={record} />
          <Badge size="xs" color="primary">
            {record.leverage}x
          </Badge>
        </Flex>
      );
    },
  } as Column<any>;
}

export function getLastColumn() {
  return {
    title: i18n.t("markets.column.last"),
    dataIndex: "24h_close",
    align: "right",
    onSort: true,
    width: 100,
    render: (value, record) => {
      return (
        <Text.numeral dp={record.quote_dp || 2} size="2xs">
          {value}
        </Text.numeral>
      );
    },
  } as Column<any>;
}

export function get24hPercentageColumn() {
  return {
    title: i18n.t("markets.column.24hPercentage"),
    dataIndex: "change",
    align: "right",
    onSort: true,
    width: 80,
    render: (value) => {
      return (
        <Text.numeral
          rule="percentages"
          coloring
          rm={Decimal.ROUND_DOWN}
          showIdentifier
          size="2xs"
        >
          {value}
        </Text.numeral>
      );
    },
  } as Column<any>;
}
