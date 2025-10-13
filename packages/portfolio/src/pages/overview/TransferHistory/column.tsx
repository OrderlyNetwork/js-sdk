import React from "react";
import { useAccount } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { API, EMPTY_LIST } from "@kodiak-finance/orderly-types";
import { Flex, TokenIcon, Text, toast, Badge } from "@kodiak-finance/orderly-ui";
import type { Column } from "@kodiak-finance/orderly-ui";
import { capitalizeString } from "@kodiak-finance/orderly-utils";

export const useColumns = () => {
  const { t } = useTranslation();
  const onCopy = () => {
    toast.success(t("common.copy.copied"));
  };
  const { state } = useAccount();
  const sub = state.subAccounts ?? [];
  const columns = React.useMemo<Column<API.TransferHistoryRow>[]>(() => {
    return [
      {
        title: t("common.token"),
        dataIndex: "token",
        width: 80,
        render(val: string) {
          return (
            <Flex gapX={2}>
              <TokenIcon name={val} size="xs" />
              <span>{val}</span>
            </Flex>
          );
        },
      },
      {
        title: t("common.time"),
        dataIndex: "updated_time",
        width: 120,
        rule: "date",
      },
      {
        title: `${t("transfer.internalTransfer.from")} (Account ID)`,
        dataIndex: "from_account_id",
        render(val: string) {
          const isMainAccount = val === state.mainAccountId;
          const subAccount = sub.find((item) => item.id === val);
          return (
            <Flex itemAlign="start" py={2} gap={1} direction="column">
              <Text.formatted onCopy={onCopy} copyable rule="address">
                {val}
              </Text.formatted>
              <Badge className="oui-select-none" color="neutral" size="xs">
                {isMainAccount
                  ? t("common.mainAccount")
                  : subAccount?.description || t("common.subAccount")}
              </Badge>
            </Flex>
          );
        },
      },
      {
        title: `${t("transfer.internalTransfer.to")} (Account ID)`,
        dataIndex: "to_account_id",
        render(val: string) {
          const isMainAccount = val === state.mainAccountId;
          const subAccount = sub.find((item) => item.id === val);
          return (
            <Flex itemAlign="start" py={2} gap={1} direction="column">
              <Text.formatted onCopy={onCopy} copyable rule="address">
                {val}
              </Text.formatted>
              <Badge className="oui-select-none" color="neutral" size="xs">
                {isMainAccount
                  ? t("common.mainAccount")
                  : subAccount?.description || t("common.subAccount")}
              </Badge>
            </Flex>
          );
        },
      },
      {
        title: t("common.status"),
        dataIndex: "status",
        width: 120,
        render(val: string) {
          return capitalizeString(val);
        },
      },
      {
        title: t("common.amount"),
        dataIndex: "amount",
        width: 80,
      },
    ];
  }, [t, state.mainAccountId, sub]);
  return columns;
};
