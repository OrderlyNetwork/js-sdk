import { useMemo } from "react";
import {
  capitalizeFirstLetter,
  Text,
  Flex,
  TokenIcon,
  toast,
  type Column,
} from "@orderly.network/ui";
import { useQuery } from "@orderly.network/hooks";
import { useTranslation, i18n } from "@orderly.network/i18n";

export const useAssetHistoryColumns = () => {
  const { data: chains } = useQuery("/v1/public/chain_info");
  const { t } = useTranslation();

  const columns = useMemo(() => {
    return [
      {
        title: t("portfolio.overview.column.token"),
        dataIndex: "token",
        width: 80,
        render: (value) => {
          return (
            <Flex gapX={1}>
              <TokenIcon name={value} size="xs" />
              <span>{value}</span>
            </Flex>
          );
        },
      },
      {
        title: t("portfolio.overview.column.time"),
        dataIndex: "created_time",
        width: 80,
        rule: "date",
      },
      {
        title: t("portfolio.overview.column.txId"),
        dataIndex: "tx_id",
        width: 120,

        render: (value, record) => {
          if (!value) {
            return <div className="oui-text-base-contrast-54">-</div>;
          }
          const chainInfo = (chains as any[])?.find(
            (item) => parseInt(record.chain_id) === parseInt(item.chain_id)
          );
          const explorer_base_url = chainInfo?.explorer_base_url;
          const href = `${explorer_base_url}/tx/${value}`;
          return (
            <a href={href} target="_blank">
              {/* <Tooltip content={value} delayDuration={0}> */}

              <Text.formatted
                copyable={!!value}
                rule="txId"
                className="oui-underline-offset-4 oui-underline oui-decoration-dashed oui-decoration-line-16"
                onCopy={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  toast.success(t("common.copy.success"));
                }}
              >
                {value}
              </Text.formatted>
              {/* </Tooltip> */}
            </a>
          );
        },
      },
      {
        title: t("portfolio.overview.column.status"),
        dataIndex: "trans_status",
        width: 100,
        render: (value) => {
          return capitalizeFirstLetter(value.toLowerCase());
        },
      },
      {
        title: t("portfolio.overview.column.type"),
        dataIndex: "side",
        width: 80,
        // formatter: (value) => capitalizeFirstLetter(value.toLowerCase()),
        render: (value) => {
          return (
            <Text color={value === "DEPOSIT" ? "deposit" : "withdraw"}>
              {value === "DEPOSIT"
                ? t("portfolio.overview.assetHistory.side.deposit")
                : t("portfolio.overview.assetHistory.side.withdraw")}
            </Text>
          );
        },
      },
      {
        title: t("portfolio.overview.column.amount"),
        dataIndex: "amount",
        width: 100,
        rule: "price",
        formatter: (value, record) =>
          record.side === "WITHDRAW"
            ? -(value - (record.fee ?? 0))
            : value - (record.fee ?? 0),
        numeralProps: {
          coloring: true,
          showIdentifier: true,
        },
        // formatter: "date",
      },
    ] as Column[];
  }, [chains, t]);

  return columns;
};

export const SIDES = [
  { label: i18n.t("common.all"), value: "All" },
  { label: i18n.t("transfer.deposit"), value: "DEPOSIT" },
  { label: i18n.t("transfer.withdraw"), value: "WITHDRAW" },
];
