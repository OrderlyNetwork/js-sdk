import React from "react";
import { useAccount } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { API } from "@orderly.network/types";
import { Flex, TokenIcon, Text, toast, Badge } from "@orderly.network/ui";
import type { Column } from "@orderly.network/ui";

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
          const findSub = sub.find((item) => item.id === val);
          return (
            <Flex itemAlign="start" py={2} gap={1} direction="column">
              <Text.formatted onCopy={onCopy} copyable rule="address">
                {val}
              </Text.formatted>
              {findSub?.description && (
                <Badge color="neutral" size="xs">
                  {findSub?.description}
                </Badge>
              )}
            </Flex>
          );
        },
      },
      {
        title: `${t("transfer.internalTransfer.to")} (Account ID)`,
        dataIndex: "to_account_id",
        render(val: string) {
          const findSub = sub.find((item) => item.id === val);
          return (
            <Flex itemAlign="start" py={2} gap={1} direction="column">
              <Text.formatted onCopy={onCopy} copyable rule="address">
                {val}
              </Text.formatted>
              {findSub?.description && (
                <Badge color="neutral" size="xs">
                  {findSub?.description}
                </Badge>
              )}
            </Flex>
          );
        },
      },
      {
        title: t("common.status"),
        dataIndex: "status",
        width: 120,
      },
      {
        title: t("common.amount"),
        dataIndex: "amount",
        width: 80,
      },
    ];
  }, [t]);
  return columns;
};
