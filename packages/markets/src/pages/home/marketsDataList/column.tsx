import { ReactNode, useCallback } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Flex, TokenIcon, Text, Badge, Column } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { FavoritesDropdownMenuWidget } from "../../../components/favoritesDropdownMenu";
import { FavoritesIcon2, UnFavoritesIcon2 } from "../../../icons";
import { FavoriteInstance } from "../../../type";

export const useMarketsDataListColumns = () => {
  const { t } = useTranslation();

  return useCallback(
    (favorite: FavoriteInstance, isFavoriteList = false) => {
      return [
        {
          title: t("common.symbol"),
          dataIndex: "symbol",
          width: 150,
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
                <Badge size="xs" color="primary">
                  {record.leverage}x
                </Badge>
              </Flex>
            );
          },
        },
        {
          title: t("markets.column.last"),
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
        },
        {
          title: t("markets.column.24hPercentage"),
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
        },
      ] as Column[];
    },
    [t],
  );
};
