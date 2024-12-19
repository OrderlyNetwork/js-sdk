import { MouseEventHandler, ReactNode } from "react";
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

export const getDropDownMarketsColumns = (
  favorite: FavoriteInstance,
  isFavoriteList = false
) => {
  return [
    {
      title: "Symbol",
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
                className="oui-cursor-pointer oui-mr-1"
              >
                {record.isFavorite ? (
                  <FavoritesIcon2 className="oui-w-3 oui-h-3 oui-text-[rgba(255,154,46,1)]" />
                ) : (
                  <UnFavoritesIcon2 className="oui-w-3 oui-h-3 oui-text-base-contrast-36 hover:oui-text-[rgba(255,154,46,1)]" />
                )}
              </Flex>
            </FavoritesDropdownMenuWidget>
          );
        }

        return (
          <Flex gapX={1}>
            {favoritesIcon}
            <TokenIcon symbol={value} className="oui-w-[18px] oui-h-[18px]" />
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
      title: "Last",
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
      title: "24h%",
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
    {
      title: "Volume",
      dataIndex: "24h_amount",
      align: "right",
      onSort: true,
      className: "oui-relative",
      width: 80,
      render: (value, record) => {
        const onDelSymbol: MouseEventHandler = (e) => {
          favorite.updateSymbolFavoriteState(
            record,
            favorite.selectedFavoriteTab,
            true
          );
          e.stopPropagation();
        };

        const iconCls =
          "oui-w-4 oui-h-4 oui-text-base-contrast-54 hover:oui-text-base-contrast";

        const actions = (
          <div className={cn("oui-absolute oui-right-1 oui-top-[3px]")}>
            <Flex
              className={cn(
                "oui-bg-primary-darken oui-py-[6px]",
                "oui-hidden group-hover:oui-inline-flex"
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
          <>
            {isFavoriteList && actions}
            <Text.numeral
              rule="human"
              dp={2}
              rm={Decimal.ROUND_DOWN}
              className={cn(isFavoriteList && "group-hover:oui-invisible")}
            >
              {value}
            </Text.numeral>
          </>
        );
      },
    },
  ] as Column[];
};
