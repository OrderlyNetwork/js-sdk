import { useMemo } from "react";
import { Flex, Text, type Column } from "@orderly.network/ui";
import { API } from "@orderly.network/types";
import { useTranslation } from "@orderly.network/i18n";

export const useFundingHistoryColumns = () => {
  const { t } = useTranslation();

  const columns = useMemo(() => {
    return [
      {
        title: t("portfolio.overview.column.symbol"),
        dataIndex: "symbol",
        width: 80,
        rule: "symbol",
        textProps: {
          showIcon: true,
        },
      },
      {
        title: t("portfolio.overview.column.time"),
        dataIndex: "created_time",
        width: 120,
        rule: "date",
      },
      {
        title: t("portfolio.overview.column.funding&AnnualRate"),
        dataIndex: "funding_rate",
        width: 80,
        render: (value: any, record) => {
          return (
            <Flex gap={1}>
              {/* <span>{`${record.funding_rate * 100}%`}</span> */}
              <Text.numeral rule={"percentages"} dp={6}>
                {record.funding_rate}
              </Text.numeral>
              <span>/</span>
              {/* <span>{`${record.annual_rate * 10}%`}</span> */}
              <Text.numeral rule={"percentages"} dp={6}>
                {record.annual_rate}
              </Text.numeral>
            </Flex>
          );
        },
      },
      {
        title: t("portfolio.overview.column.paymentType"),
        dataIndex: "payment_type",
        width: 80,
        render: (value: any) => {
          switch (value) {
            case "Pay":
            case "Paid":
              return t("portfolio.overview.column.paymentType.paid");
            case "Receive":
            case "Received":
              return t("portfolio.overview.column.paymentType.received");
            default:
              return value;
          }
        },
      },
      {
        title: t("portfolio.overview.column.fundingFee"),
        dataIndex: "funding_fee",
        width: 80,
        rule: "price",
        formatter(value, record, index) {
          return Number(value) * -1;
        },
        numeralProps: {
          coloring: true,
          showIdentifier: true,
          ignoreDP: true,
        },
      },
    ] as Column<API.FundingFeeRow & { annual_rate: number }>[];
  }, [t]);

  return columns;
};
