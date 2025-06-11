import { FC, useCallback, useMemo } from "react";
import { usePrivateInfiniteQuery } from "@orderly.network/hooks";
import {
  Grid,
  Statistic,
  DataTable,
  Text,
  ListView,
  Flex,
  useScreen,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { EndReachedBox } from "./endReachedBox";

type FundingFeeHistory = {
  created_time: number;
  funding_fee: number;
  funding_rate: number;
  mark_price: number;
  payment_type: "Pay" | "Receive";
  status: "Accrued" | "Settled";
  symbol: string;
  updated_time: number;
};

export const FundingFeeHistoryUI: FC<{ total: string; symbol: string }> = ({
  total,
  symbol,
}) => {
  const { isMobile } = useScreen();

  const { isLoading, data, setSize } =
    usePrivateInfiniteQuery<FundingFeeHistory>(
      (pageIndex, previousPageData) => {
        if (previousPageData && !previousPageData.length) return null;
        return `/v1/funding_fee/history?page=${pageIndex}&symbol=${symbol}`;
      },
    );

  const loadMore = useCallback(() => {
    setSize((prev) => prev + 1);
  }, [setSize]);

  const flattenData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.flat();
  }, [data]);

  const listView = useMemo(() => {
    if (isMobile) {
      return (
        <HistoryDataListViewSimple
          data={flattenData ?? []}
          isLoading={isLoading}
          loadMore={loadMore}
        />
      );
    }
    return (
      <HistoryDataListView
        data={flattenData ?? []}
        isLoading={isLoading}
        loadMore={loadMore}
      />
    );
  }, [isMobile, flattenData, isLoading]);

  return (
    <div className="oui-h-full">
      <Grid
        cols={2}
        gapX={3}
        className="oui-sticky oui-top-0 oui-z-10 oui-bg-base-8 oui-py-4"
      >
        <div className="oui-bg-base-9 oui-rounded-lg oui-p-3 oui-border oui-border-line-6">
          {/* <Statistic label={"Instrument"} /> */}
          <Flex direction={"column"} gap={1} itemAlign={"start"}>
            <span className="oui-text-2xs oui-text-base-contrast-36">
              Instrument
            </span>
            <Text.formatted
              rule="symbol"
              className="oui-font-semibold"
              intensity={98}
            >
              {symbol}
            </Text.formatted>
          </Flex>
        </div>
        <div className="oui-bg-base-9 oui-rounded-lg oui-p-3 oui-border oui-border-line-6">
          <Statistic
            label="Funding fee (USDC)"
            valueProps={{
              ignoreDP: true,
              coloring: true,
              showIdentifier: true,
            }}
          >
            {total}
          </Statistic>
        </div>
      </Grid>
      {listView}
    </div>
  );
};

type ListProps = {
  isLoading: boolean;
  data: any[];
  loadMore: () => void;
};

const HistoryDataListView: FC<ListProps> = ({ isLoading, data, loadMore }) => {
  const columns = useMemo(() => {
    return [
      {
        title: "Time",
        dataIndex: "created_time",
        width: 120,
        render: (value: string) => {
          return <Text.formatted rule="date">{value}</Text.formatted>;
        },
      },
      {
        title: "Funding rate",
        dataIndex: "funding_rate",
        formatter: (value: string) => new Decimal(value).mul(100).toString(),
        render: (value: string) => {
          return <span>{`${value}%`}</span>;
        },
      },
      {
        title: "Payment type",
        dataIndex: "payment_type",
        formatter: (value: string) => {
          return value === "Pay" ? "Paid" : "Received";
        },
        render: (value) => <span>{value}</span>,
      },
      {
        title: "Funding fee (USDC)",
        dataIndex: "funding_fee",
        render: (value: string) => {
          return (
            <Text.numeral rule="price" coloring showIdentifier ignoreDP>
              {value}
            </Text.numeral>
          );
        },
      },
    ];
  }, []);
  return (
    <EndReachedBox onEndReached={loadMore}>
      <DataTable
        className="oui-text-sm oui-bg-base-8"
        columns={columns}
        dataSource={data ?? []}
        loading={isLoading}
      />
    </EndReachedBox>
  );
};

const HistoryDataListViewSimple: FC<ListProps> = ({
  data,
  isLoading,
  loadMore,
}) => {
  const renderItem = useCallback((item: FundingFeeHistory) => {
    return <FundingFeeItem item={item} />;
  }, []);
  return (
    <ListView
      dataSource={data}
      renderItem={renderItem}
      isLoading={isLoading}
      contentClassName="oui-space-y-0"
      loadMore={loadMore}
    />
  );
};

const FundingFeeItem: FC<{
  item: any;
}> = ({ item }) => {
  return (
    <div className="oui-flex oui-flex-col oui-space-y-2 oui-border-t oui-border-line-6 oui-py-2">
      <Flex justify={"between"}>
        <Statistic
          label="Funding rate"
          classNames={{
            label: "oui-text-2xs",
          }}
          valueProps={{
            ignoreDP: true,
            rule: "percentages",
            className: "oui-text-xs",
          }}
        >
          {item.funding_rate}
        </Statistic>
        <Statistic
          label="Amount"
          className="oui-items-end"
          classNames={{
            label: "oui-text-2xs",
          }}
          valueProps={{
            ignoreDP: true,
            coloring: true,
            as: "div",
            className: "oui-text-xs",
            showIdentifier: true,
          }}
        >
          {item.funding_fee}
        </Statistic>
      </Flex>
      <Flex justify={"between"}>
        <Text.formatted
          rule="date"
          className="oui-text-base-contrast-36"
          size="2xs"
        >
          {item.created_time}
        </Text.formatted>
        <Text size="sm" intensity={80}>
          {item.payment_type === "Pay" ? "Paid" : "Received"}
        </Text>
      </Flex>
    </div>
  );
};
