import { useMemo } from "react";
import { type Column, Flex, TokenIcon, Text, Box } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { FavoritesIcon, UnFavoritesIcon } from "../icons";
import { FavoritesDropdownMenu } from "./dataList.ui";
import { TFavorite } from "../../type";

export const useDataListColumns = (
  favorite: TFavorite,
  isFavoriteList = false
) => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: <UnFavoritesIcon className="oui-ml-1 oui-cursor-pointer" />,
        dataIndex: "isFavorite",
        width: 30,
        render: (value, record) => {
          const onDelSymbol = () => {
            favorite.updateSymbolFavoriteState(record, favorite.curTab, true);
          };

          const button = (
            <Box
              className="oui-text-base-contrast-36 hover:oui-text-base-contrast"
              onClick={isFavoriteList ? onDelSymbol : undefined}
            >
              {value ? (
                <FavoritesIcon className="oui-cursor-pointer" />
              ) : (
                <UnFavoritesIcon className="oui-cursor-pointer" />
              )}
            </Box>
          );

          if (isFavoriteList) {
            return button;
          }

          return (
            <FavoritesDropdownMenu row={record} favorite={favorite}>
              {button}
            </FavoritesDropdownMenu>
          );
        },
      },
      {
        title: "Market",
        dataIndex: "symbol",
        width: 80,
        render: (value) => {
          return (
            <Flex gapX={1}>
              <TokenIcon symbol={value} size="xs" />
              <Text.formatted
                rule="symbol"
                formatString="base-type"
                size="xs"
                weight="semibold"
              >
                {value}
              </Text.formatted>
            </Flex>
          );
        },
      },
      {
        title: "Price",
        dataIndex: "24h_close",
        width: 100,
        align: "right",
        onSort: true,
        render: (value, record) => {
          return <Text.numeral dp={record.quote_dp || 2}>{value}</Text.numeral>;
        },
      },
      {
        title: "24h change",
        dataIndex: "change",
        width: 100,
        align: "right",
        onSort: true,
        render: (value) => {
          return (
            <Text.numeral
              rule="percentages"
              coloring
              rm={Decimal.ROUND_DOWN}
              showIdentifier
            >
              {value}
            </Text.numeral>
          );
        },
      },
      {
        title: "24h volume",
        dataIndex: "24h_amount",
        width: 100,
        align: "right",
        onSort: true,
        render: (value) => {
          return (
            <Text.numeral dp={0} rm={Decimal.ROUND_DOWN}>
              {value}
            </Text.numeral>
          );
        },
      },
      {
        title: "Open interest",
        dataIndex: "openInterest",
        width: 100,
        align: "right",
        onSort: true,
        render: (value) => {
          return (
            <Text.numeral dp={0} rm={Decimal.ROUND_DOWN}>
              {value}
            </Text.numeral>
          );
        },
      },
      {
        title: "8h funding",
        dataIndex: "8h_funding",
        width: 100,
        align: "right",
        onSort: true,
        render: (value) => {
          return (
            <Text.numeral
              rule="percentages"
              coloring
              dp={4}
              rm={Decimal.ROUND_DOWN}
              showIdentifier
            >
              {value}
            </Text.numeral>
          );
        },
      },
    ];
  }, [favorite, isFavoriteList]);

  return columns;
};
