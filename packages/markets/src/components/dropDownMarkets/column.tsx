import { MouseEventHandler, ReactNode } from "react";
import { Flex, TokenIcon, Text, Badge, cn } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import {
  DeleteIcon,
  FavoritesIcon2,
  TopIcon,
  UnFavoritesIcon2,
} from "../../icons";
import { FavoriteInstance } from "../../type";
import { FavoritesDropdownMenuWidget } from "../favoritesDropdownMenu";
import { Column } from "../Table";

export const getDropDownMarketsColumns = (
  favorite: FavoriteInstance,
  isFavoriteList = false
) => {
  return [
    {
      title: "Instrument",
      dataIndex: "symbol",
      className: "oui-h-[36px]",
      render: (value, record) => {
        return (
          <Flex gapX={1}>
            <TokenIcon symbol={value} className="oui-w-[18px] oui-h-[18px]" />
            <Text.formatted
              rule="symbol"
              formatString="base"
              size="2xs"
              weight="semibold"
            >
              {value}
            </Text.formatted>
            <Badge size="xs" color="primaryLight">
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
      className: "oui-h-[36px]",
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
      className: "oui-h-[36px]",
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
      className: "oui-h-[36px]",
      render: (value) => {
        return (
          <Text.numeral rule="human" dp={2} rm={Decimal.ROUND_DOWN}>
            {value}
          </Text.numeral>
        );
      },
    },
  ] as Column[];
};
