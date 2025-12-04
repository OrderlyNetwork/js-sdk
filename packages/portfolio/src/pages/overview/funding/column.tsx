import { useMemo } from "react";
import { useTranslation } from "@veltodefi/i18n";
import { API } from "@veltodefi/types";
import { Flex, Text, type Column } from "@veltodefi/ui";

export const useFundingHistoryColumns = () => {
  const { t } = useTranslation();

  const columns = useMemo(() => {
    return [
      {
        title: t("common.symbol"),
        dataIndex: "symbol",
        width: 80,
        rule: "symbol",
        textProps: {
          showIcon: true,
        },
      },
      {
        title: t("common.time"),
        dataIndex: "created_time",
        width: 120,
        rule: "date",
      },
      {
        title: `${t("funding.fundingRate")} / ${t("funding.annualRate")}`,
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
        title: t("funding.paymentType"),
        dataIndex: "payment_type",
        width: 80,
        render: (value: any) => {
          switch (value) {
            case "Pay":
            case "Paid":
              return t("funding.paymentType.paid");
            case "Receive":
            case "Received":
              return t("funding.paymentType.received");
            default:
              return value;
          }
        },
      },
      {
        title: `${t("funding.fundingFee")} (USDC)`,
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
