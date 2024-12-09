import { MouseEventHandler } from "react";
import { Flex, TokenIcon, Text, Badge, cn, Column } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { DeleteIcon, TopIcon } from "../../icons";
import { FavoriteInstance } from "../../type";

export const getMarketsSheetColumns = (
  favorite: FavoriteInstance,
  isFavoriteList = false
) => {
  return [
    {
      title: "Market / Volume",
      dataIndex: "24h_amount",
      onSort: true,
      className: "oui-h-[36px]",
      render: (value, record) => {
        return (
          <Flex direction="column" itemAlign="start" gapY={1}>
            <Flex gapX={1}>
              <TokenIcon
                symbol={record.symbol}
                className="oui-w-[18px] oui-h-[18px]"
              />
              <Text.formatted
                rule="symbol"
                formatString="base"
                size="2xs"
                weight="semibold"
              >
                {record.symbol}
              </Text.formatted>
              <Badge size="xs" color="primary">
                {record.leverage}x
              </Badge>
            </Flex>

            <Text.numeral
              intensity={54}
              rule="human"
              dp={2}
              rm={Decimal.ROUND_DOWN}
            >
              {value}
            </Text.numeral>
          </Flex>
        );
      },
    },
    {
      title: "Price / change",
      dataIndex: "change",
      align: "right",
      onSort: true,
      className: "oui-h-[36px]",
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
          <div
            className={cn(
              "oui-absolute oui-right-0 oui-top-[6.5px]",
              "oui-hidden group-hover:oui-block"
            )}
          >
            <Flex
              className={cn(
                "oui-inline-flex",
                "oui-bg-primary-darken oui-py-[6px]"
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
