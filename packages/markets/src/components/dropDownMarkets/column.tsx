import { MouseEventHandler, useCallback } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Flex, Text, cn, Column } from "@kodiak-finance/orderly-ui";
import { Decimal } from "@kodiak-finance/orderly-utils";
import { DeleteIcon, TopIcon } from "../../icons";
import { FavoriteInstance } from "../../type";
import {
  get24hPercentageColumn,
  getLastColumn,
  getSymbolColumn,
} from "../shared/column";

export const useDropDownMarketsColumns = () => {
  const { t } = useTranslation();

  return useCallback(
    (favorite: FavoriteInstance, isFavoriteList = false) => {
      return [
        getSymbolColumn(favorite, isFavoriteList),
        getLastColumn(),
        get24hPercentageColumn(),
        {
          title: t("common.volume"),
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
                true,
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
                    "oui-hidden group-hover:oui-inline-flex",
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
    },
    [t],
  );
};
