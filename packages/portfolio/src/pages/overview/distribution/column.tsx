import { useMemo } from "react";

import { Flex, type TableColumn, Text, TokenIcon } from "@orderly.network/ui";
import { API } from "@orderly.network/types";

export const useColumns = () => {
  const columns = useMemo(() => {
    return [
      {
        title: "Token",
        dataIndex: "token",
        width: 80,
        // rule: "symbol",
        render: (value, record) => {
          return (
            <Flex gapX={2}>
              <TokenIcon name={value} size="xs" />
              <span>{value}</span>
            </Flex>
          );
        },
      },
      {
        title: "Time",
        dataIndex: "updated_time",
        width: 120,
        rule: "date",
      },
      {
        title: "Status",
        dataIndex: "status",
        width: 120,
        formatter(value, record, index) {
          switch (value) {
            case "CREATED":
            case "SPLIT":
              return "Processing";
            case "COMPLETED":
            default:
              return "Completed";
          }
        },
      },

      {
        title: "Type",
        dataIndex: "type",
        width: 80,
        formatter: (value: any) => {
          switch (value) {
            case "REFERRER_REBATE":
              return "Referral commission";
            case "REFEREE_REBATE":
              return "Referee rebate";
            case "BROKER_FEE":
              return "Broker fee";
            default:
              return "-";
          }
        },
      },
      {
        title: "Amount",
        dataIndex: "amount",
        width: 80,
        // rule: "price",
      },
    ] as TableColumn<API.FundingFeeRow & { annual_rate: number }>[];
  }, []);

  return columns;
};

export const TYPES = [
  { label: "All", value: "All" },
  { label: "Referral commission", value: "REFERRER_REBATE" },
  { label: "Referee rebate", value: "REFEREE_REBATE" },
  { label: "Broker fee", value: "BROKER_FEE" },
];
