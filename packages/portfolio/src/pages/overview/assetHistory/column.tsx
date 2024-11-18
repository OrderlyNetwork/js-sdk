import { useMemo } from "react";
import {
  capitalizeFirstLetter,
  Text,
  Flex,
  TokenIcon,
  toast,
  type TableColumn,
} from "@orderly.network/ui";
import { useQuery } from "@orderly.network/hooks";

export const useAssetHistoryColumns = () => {
  const { data: chains } = useQuery("/v1/public/chain_info");

  const columns = useMemo(() => {
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
                  toast.success("Copy success");
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
    ] as TableColumn[];
  }, [chains]);

  return columns;
};

export const SIDES = [
  { label: "All", value: "All" },
  { label: "Deposit", value: "DEPOSIT" },
  { label: "Withdrawal", value: "WITHDRAW" },
];
