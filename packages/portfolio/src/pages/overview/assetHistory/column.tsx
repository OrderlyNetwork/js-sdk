import { useMemo } from "react";
import {
  capitalizeFirstLetter,
  Text,
  type Column,
  Box,
  Flex,
  TokenIcon,
} from "@orderly.network/ui";

export const useAssetHistoryColumns = () => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Token",
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
        title: "Time",
        dataIndex: "created_time",
        width: 80,
        rule: "date",
      },
      {
        title: "TxID",
        dataIndex: "tx_id",
        width: 120,
        rule: "txId",
        copyable: true,
        textProps: (value) => ({
          copyable: !!value,
          className:
            "oui-underline-offset-4 oui-underline oui-decoration-dashed oui-decoration-line-16",
        }),
      },
      {
        title: "Status",
        dataIndex: "trans_status",
        width: 100,
        formatter: (value) => capitalizeFirstLetter(value.toLowerCase()),
      },
      {
        title: "Type",
        dataIndex: "side",
        width: 80,
        formatter: (value) => capitalizeFirstLetter(value.toLowerCase()),
        render: (value) => {
          return <Text color={value.toLowerCase()}>{value}</Text>;
        },
      },
      {
        title: "Amount",
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
    ];
  }, []);

  return columns;
};

export const SIDES = [
  { label: "All", value: "All" },
  { label: "Deposit", value: "DEPOSIT" },
  { label: "Withdrawal", value: "WITHDRAW" },
];
