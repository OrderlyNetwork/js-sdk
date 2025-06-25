import React from "react";
// import { useIndexPrice } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { Button, Flex, Text, TokenIcon } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";

export interface ColumnsOptions {
  onClick?: (id: string) => void;
}

// Define the enhanced holding interface with calculated fields
interface EnhancedHolding {
  token: string;
  holding: number;
  indexPrice: number;
  assetValue: number;
  collateralRatio: number;
  collateralContribution: number;
  account_id: string;
}

export const useAssetsColumns = (options: ColumnsOptions) => {
  const { t } = useTranslation();
  const { onClick } = options;
  const columns = React.useMemo<Column[]>(() => {
    return [
      {
        title: t("portfolio.overview.column.token"),
        dataIndex: "token",
        align: "left",
        width: 150,
        render(val: string) {
          return (
            <Flex itemAlign="center" gap={2}>
              <TokenIcon name={val} />
              {val}
            </Flex>
          );
        },
      },
      {
        title: t("portfolio.overview.column.qty"),
        dataIndex: "holding",
        align: "left",
        width: 170,
        render(val: number) {
          return (
            <Text.numeral dp={6} padding={false}>
              {val}
            </Text.numeral>
          );
        },
      },
      {
        title: t("portfolio.overview.column.indexPrice"),
        dataIndex: "indexPrice",
        align: "left",
        width: 100,
        render(val: number) {
          return (
            <Text.numeral rule="price" dp={2} currency="$">
              {val}
            </Text.numeral>
          );
        },
      },
      {
        title: "Asset Value",
        dataIndex: "assetValue",
        align: "left",
        width: 120,
        render(val: number) {
          return (
            <Text.numeral rule="price" dp={2} currency="$">
              {val}
            </Text.numeral>
          );
        },
      },
      {
        title: t("portfolio.overview.column.collateralRatio"),
        dataIndex: "collateralRatio",
        align: "left",
        width: 140,
        render(val: number) {
          return (
            <Text.numeral dp={2} suffix="%">
              {val * 100}
            </Text.numeral>
          );
        },
      },
      {
        title: "Collateral Contribution",
        dataIndex: "collateralContribution",
        align: "left",
        width: 160,
        render(val: number, record: EnhancedHolding) {
          return (
            <Text.numeral rule="price" dp={2} currency="$">
              {val}
            </Text.numeral>
          );
        },
      },
      {
        title: null,
        dataIndex: "account_id",
        align: "center",
        width: 100,
        render(id: string) {
          return (
            <Button
              size={"sm"}
              variant={"outlined"}
              color={"secondary"}
              onClick={() => onClick?.(id)}
            >
              {t("common.transfer")}
            </Button>
          );
        },
      },
    ];
  }, [t, onClick]);
  return columns;
};
