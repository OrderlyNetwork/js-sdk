import { FC } from "react";
import { useSymbolsInfo } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { DataFilter, Flex, ListView, Text, Badge } from "@orderly.network/ui";
import { type UseFundingHistoryReturn } from "./useDataSource.script";

type FundingHistoryProps = {} & UseFundingHistoryReturn;

export const FundingHistoryMobile: FC<FundingHistoryProps> = (props) => {
  const { dataSource, queryParameter, onFilter, isLoading, pagination } = props;
  const symbols = useSymbolsInfo();
  const { symbol, dateRange } = queryParameter;
  const { t } = useTranslation();

  const switchPaymentType = (paymentType: string) => {
    switch (paymentType) {
      case "Pay":
      case "Paid":
        return t("funding.paymentType.paid");
      case "Receive":
      case "Received":
        return t("funding.paymentType.received");
      default:
        return paymentType;
    }
  };

  const loadMore = () => {
    if (dataSource && dataSource.length < (pagination?.count || 0)) {
      pagination?.onPageSizeChange?.(pagination?.pageSize + 50);
    }
  };

  const renderHistoryItem = (item: any) => {
    return (
      <Flex
        p={2}
        direction="column"
        gapY={2}
        className="oui-rounded-xl oui-bg-base-9 oui-font-semibold"
      >
        <Flex direction="row" justify="between" width="100%" height="20px">
          <Text.formatted
            rule="symbol"
            className="oui-text-base-contrast oui-mr-1 oui-text-sm"
          >
            {item.symbol}
          </Text.formatted>
          <Badge color="neutral" size="xs">
            {switchPaymentType(item.payment_type)}
          </Badge>
          <Text.formatted
            rule="date"
            className="oui-text-base-contrast-36 oui-text-2xs oui-ml-auto"
          >
            {item.created_time}
          </Text.formatted>
        </Flex>
        <div className="oui-w-full oui-h-[1px] oui-bg-base-6" />
        <Flex direction="row" justify="between" width="100%">
          <Flex direction="column">
            <Text className="oui-text-base-contrast-36 oui-text-2xs">
              {t("funding.fundingRate")}
            </Text>
            <Text.numeral
              rule={"percentages"}
              dp={6}
              className="oui-text-base-contrast-80 oui-text-xs"
            >
              {item.funding_rate}
            </Text.numeral>
          </Flex>
          <Flex direction="column">
            <Text className="oui-text-base-contrast-36 oui-text-2xs">
              {t("funding.annualRate")}
            </Text>
            <Text.numeral
              rule={"percentages"}
              dp={6}
              className="oui-text-base-contrast-80 oui-text-xs"
            >
              {item.annual_rate}
            </Text.numeral>
          </Flex>
          <Flex direction="column">
            <Text className="oui-text-base-contrast-36 oui-text-2xs">
              {t("funding.fundingFee")}{" "}
              <Text className="oui-text-base-contrast-20">(USDC)</Text>
            </Text>
            <Text.numeral
              dp={6}
              ignoreDP={true}
              coloring={true}
              showIdentifier={true}
              className="oui-text-xs oui-self-end"
            >
              {Number(item.funding_fee) * -1}
            </Text.numeral>
          </Flex>
        </Flex>
      </Flex>
    );
  };

  return (
    <>
      <DataFilter
        items={[
          {
            type: "select",
            name: "symbol",
            isCombine: true,
            options: [
              {
                label: "All",
                value: "All",
              },
              ...Object.keys(symbols).map((symbol) => {
                const s = symbol.split("_")[1];
                return {
                  label: s,
                  value: symbol,
                };
              }),
            ],
            value: symbol,
            valueFormatter: (value) => {
              if (value === "All") {
                return "All";
              }
              return value.split("_")[1];
            },
          },
          {
            type: "range",
            name: "dateRange",
            value: {
              from: dateRange[0],
              to: dateRange[1],
            },
          },
        ]}
        onFilter={(value) => {
          onFilter(value);
        }}
        className="oui-px-3 oui-py-2 oui-sticky oui-top-[44px] oui-z-10 oui-bg-base-10"
      />
      <ListView
        dataSource={dataSource}
        renderItem={renderHistoryItem}
        contentClassName="!oui-space-y-1"
        loadMore={loadMore}
        isLoading={isLoading}
        className="oui-px-1"
      />
    </>
  );
};
