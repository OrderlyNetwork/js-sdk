import { useMemo } from "react";

import { Flex, type Column, Text } from "@orderly.network/ui";
import { API } from "@orderly.network/types";

export const useColumns = () => {
  const columns = useMemo<
    Column<API.FundingFeeRow & { annual_rate: number }>[]
  >(() => {
    return [
      {
        title: "Token",
        dataIndex: "token",
        width: 80,
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
            case "REFERRAL_REBATE":
              return "Referral commision";
            case "REFEREE_REBATE":
              return "Referee rebate";
            case "REFERRAL_FEE":
            default:
              return "Broker fee";
          }
        },
      },
      {
        title: "Amount",
        dataIndex: "amount",
        width: 80,
        rule: "price",
      },
    ];
  }, []);

  return columns;
};

export const TYPES = [
  { label: "All", value: "All" },
  { label: "Referral commision", value: "REFEREE_REBATE" },
  { label: "Referee rebate", value: "REFERRER_REBATE" },
  { label: "Broker fee", value: "BROKER_FEE" },
];
