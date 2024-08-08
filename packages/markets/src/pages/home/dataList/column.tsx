import { MouseEventHandler, useMemo } from "react";
import {
  type Column,
  Flex,
  TokenIcon,
  Text,
  Box,
  Tooltip,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { FavoritesIcon, MoveToTopIcon, UnFavoritesIcon } from "../../../icons";
import { FavoritesDropdownMenu } from "./dataList.ui";
import { TFavorite } from "../../../type";

export const useDataListColumns = (
  favorite: TFavorite,
  isFavoriteList = false
) => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: (
          <Flex
            width="100%"
            height="100%"
            justify="center"
            itemAlign="center"
            mr={3}
          >
            <UnFavoritesIcon />
          </Flex>
        ),
        dataIndex: "isFavorite",
        width: 30,
        render: (value, record) => {
          const onDelSymbol: MouseEventHandler = (e) => {
            favorite.updateSymbolFavoriteState(record, favorite.curTab, true);
            e.stopPropagation();
          };

          const button = (
            <Flex
              width="100%"
              height="100%"
              mr={3}
              justify="center"
              itemAlign="center"
              onClick={isFavoriteList ? onDelSymbol : undefined}
            >
              {value ? (
                <FavoritesIcon className="oui-text-[rgba(255,154,46,1)]" />
              ) : (
                <UnFavoritesIcon className="oui-text-base-contrast-36 hover:oui-text-[rgba(255,154,46,1)]" />
              )}
            </Flex>
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
        width: 90,
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
          return (
            <Text.numeral dp={record.quote_dp || 2} currency="$">
              {value}
            </Text.numeral>
          );
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
            <Text.numeral currency="$" dp={0} rm={Decimal.ROUND_DOWN}>
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
            <Text.numeral currency="$" dp={0} rm={Decimal.ROUND_DOWN}>
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
              {value || 0}
            </Text.numeral>
          );
        },
      },
      {
        title: "",
        dataIndex: "",
        width: 40,
        render: (value, record) => {
          if (isFavoriteList) {
            return (
              <Flex justify="end" mr={4}>
                <Tooltip content="Move to top" align="center" delayDuration={0}>
                  <Box
                    className="oui-hidden group-hover:oui-block oui-cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      favorite.pinToTop(record);
                    }}
                  >
                    <MoveToTopIcon className="oui-text-base-contrast-20 hover:oui-text-base-contrast" />
                  </Box>
                </Tooltip>
              </Flex>
            );
          }
          return null;
        },
      },
    ];
  }, [favorite, isFavoriteList]);

  return columns;
};
