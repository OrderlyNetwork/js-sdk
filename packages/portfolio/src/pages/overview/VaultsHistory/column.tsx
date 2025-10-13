import React from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import type { API } from "@kodiak-finance/orderly-types";
import { Flex, TokenIcon, Text, cn } from "@kodiak-finance/orderly-ui";
import type { Column } from "@kodiak-finance/orderly-ui";
import { capitalizeString } from "@kodiak-finance/orderly-utils";

export const useColumns = () => {
  const { t } = useTranslation();
  const columns = React.useMemo<Column<API.StrategyVaultHistoryRow>[]>(() => {
    return [
      {
        title: t("common.type"),
        dataIndex: "type",
        className: (record) => {
          if (record?.type === "deposit") {
            return "oui-text-success";
          }
          if (record?.type === "withdrawal") {
            return "oui-text-danger";
          }
          return "";
        },
        render(val: string) {
          if (val === "deposit") {
            return t("common.deposit");
          }
          if (val === "withdrawal") {
            return t("common.withdraw");
          }
          return null;
        },
      },
      {
        title: t("portfolio.overview.vaultName"),
        dataIndex: "vaultName",
      },
      {
        title: t("common.token"),
        dataIndex: "token",
        render(val: string) {
          return (
            <Flex justify="start" itemAlign="center" gap={2}>
              <TokenIcon name={val} />
              {val}
            </Flex>
          );
        },
      },
      {
        title: t("common.time"),
        dataIndex: "created_time",
        rule: "date",
      },
      {
        title: t("common.status"),
        dataIndex: "status",
        render(val: string) {
          return capitalizeString(val);
        },
      },
      {
        title: t("common.amount"),
        dataIndex: "amount_change",
        render(val: number) {
          return (
            <Text.numeral
              showIdentifier
              className={cn(
                "oui-select-none",
                val >= 0 ? "oui-text-success" : "oui-text-danger",
              )}
            >
              {val}
            </Text.numeral>
          );
        },
      },
    ];
  }, [t]);
  return columns;
};
