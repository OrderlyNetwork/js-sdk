import { useMemo } from "react";
import { capitalizeFirstLetter, Text, type Column } from "@orderly.network/ui";

export const useAssetHistoryColumns = () => {
  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Token",
        dataIndex: "token",
        width: 80,
      },
      {
        title: "Time",
        dataIndex: "block_time",
        width: 80,
        rule: "date",
      },
      {
        title: "TxID",
        dataIndex: "tx_id",
        width: 120,
        rule: "txId",
        copyable: true,
        textProps: {
          copyable: true,
          className:
            "oui-underline-offset-4 oui-underline oui-decoration-dashed oui-decoration-red-500",
        },
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
          record.side === "WITHDRAW" ? -value : value,
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
