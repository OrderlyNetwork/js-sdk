import React from "react";
import { useTokensInfo } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { Button, cn, Flex, Text, TokenIcon } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";

export interface ColumnsOptions {
  onTransfer?: (accountId: string, token: string) => void;
  onConvert?: (accountId: string, token: string) => void;
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
  const tokensInfo = useTokensInfo();
  const { onTransfer, onConvert } = options;
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
        width: 140,
        render(val: number, record) {
          const findToken = tokensInfo?.find(
            ({ token }) => token === record.token,
          );
          return (
            <Text.numeral dp={findToken?.decimals ?? 6} padding={false}>
              {val}
            </Text.numeral>
          );
        },
      },
      {
        title: t("portfolio.overview.column.indexPrice"),
        dataIndex: "indexPrice",
        align: "left",
        width: 140,
        render(val: number) {
          return (
            <Text.numeral rule="price" dp={6} currency="$" padding={false}>
              {val}
            </Text.numeral>
          );
        },
      },
      {
        title: t("portfolio.overview.column.assetValue"),
        dataIndex: "assetValue",
        align: "left",
        width: 140,
        render(val: number) {
          return (
            <Text.numeral rule="price" dp={6} currency="$" padding={false}>
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
        title: t("transfer.deposit.collateralContribution"),
        dataIndex: "collateralContribution",
        align: "left",
        width: 140,
        render(val: number) {
          return (
            <Text.numeral rule="price" dp={6} currency="$" padding={false}>
              {val}
            </Text.numeral>
          );
        },
      },
      {
        title: null,
        dataIndex: "account_id",
        align: "right",
        width: 180,
        render(id: string, record: EnhancedHolding) {
          return (
            <Flex itemAlign="center" gap={3}>
              <Button
                size={"sm"}
                variant={"outlined"}
                color={"secondary"}
                onClick={() => onConvert?.(id, record.token)}
                className={cn(
                  record.token === "USDC" ? "oui-invisible" : "oui-visible",
                )}
              >
                {t("transfer.convert")}
              </Button>
              {onTransfer && (
                <Button
                  size={"sm"}
                  variant={"outlined"}
                  color={"secondary"}
                  onClick={() => onTransfer?.(id, record.token)}
                >
                  {t("common.transfer")}
                </Button>
              )}
            </Flex>
          );
        },
      },
    ];
  }, [t, tokensInfo, onTransfer, onConvert]);
  return columns;
};
