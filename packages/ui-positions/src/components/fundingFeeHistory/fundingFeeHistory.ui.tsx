import { FC, useCallback, useMemo } from "react";
import { usePrivateInfiniteQuery } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { EMPTY_LIST } from "@orderly.network/types";
import {
  Grid,
  Statistic,
  DataTable,
  Text,
  ListView,
  Flex,
  useScreen,
  cn,
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

const PAGE_SIZE = 60;

export const FundingFeeHistoryUI: FC<{
  total: number;
  symbol: string;
  start_t: string;
  end_t: string;
}> = ({ total, symbol, start_t, end_t }) => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const { isLoading, data, setSize } =
    usePrivateInfiniteQuery<FundingFeeHistory>(
      (pageIndex, previousPageData) => {
        if (
          (!previousPageData || (previousPageData.length ?? 0) < PAGE_SIZE) &&
          pageIndex > 0
        )
          return null;
        return `/v1/funding_fee/history?page=${pageIndex + 1}&size=${PAGE_SIZE}&symbol=${symbol}&start_t=${start_t}&end_t=${end_t}`;
      },
      {
        revalidateFirstPage: false,
      },
    );

  const loadMore = useCallback(() => {
    setSize((prev) => {
      return prev + 1;
    });
  }, [setSize]);

  const flattenData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    return data.flat().map((item) => {
      return {
        ...item,
        funding_fee: -item.funding_fee,
      };
    });
  }, [data]);

  const listView = useMemo(() => {
    if (isMobile) {
      return (
        <HistoryDataListViewSimple
          data={flattenData ?? EMPTY_LIST}
          isLoading={isLoading}
          loadMore={loadMore}
        />
      );
    }
    return (
      <HistoryDataListView
        data={flattenData ?? EMPTY_LIST}
        isLoading={isLoading}
        loadMore={loadMore}
      />
    );
  }, [isMobile, flattenData, isLoading]);

  return (
    <div>
      <Grid
        cols={2}
        gapX={3}
        className="oui-sticky oui-top-0 oui-z-10 oui-bg-base-8 oui-py-4"
      >
        <div className="oui-rounded-lg oui-border oui-border-line-6 oui-bg-base-9 oui-p-3">
          {/* <Statistic label={"Instrument"} /> */}
          <Flex direction={"column"} gap={1} itemAlign={"start"}>
            <span className="oui-text-2xs oui-text-base-contrast-36">
              {t("common.symbol")}
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
        <div className="oui-rounded-lg oui-border oui-border-line-6 oui-bg-base-9 oui-p-3">
          <Statistic
            label={`${t("funding.fundingFee")} (USDC)`}
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
  const { t } = useTranslation();
  const columns = useMemo(() => {
    return [
      {
        title: t("common.time"),
        dataIndex: "created_time",
        width: 120,
        render: (value: string) => {
          return <Text.formatted rule="date">{value}</Text.formatted>;
        },
      },
      {
        title: t("funding.fundingRate"),
        dataIndex: "funding_rate",
        formatter: (value: string) => new Decimal(value).mul(100).toString(),
        render: (value: string) => {
          return <span>{`${value}%`}</span>;
        },
      },
      {
        title: t("funding.paymentType"),
        dataIndex: "payment_type",
        formatter: (value: string) => {
          return value === "Pay"
            ? t("funding.paymentType.paid")
            : t("funding.paymentType.received");
        },
        render: (value) => <span>{value}</span>,
      },
      {
        title: `${t("funding.fundingFee")} (USDC)`,
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
  }, [t]);

  return (
    <div className="oui-h-[calc(80vh_-_132px_-_8px)] oui-overflow-y-auto">
      <EndReachedBox onEndReached={loadMore}>
        <DataTable
          classNames={{
            root: cn("oui-h-auto oui-bg-base-8 oui-text-sm"),
          }}
          columns={columns}
          dataSource={data ?? EMPTY_LIST}
          loading={isLoading}
        />
      </EndReachedBox>
    </div>
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
    <div className="oui-h-[calc(80vh_-_104px)] oui-overflow-y-auto">
      <ListView
        dataSource={data}
        renderItem={renderItem}
        isLoading={isLoading}
        contentClassName="oui-space-y-0"
        loadMore={loadMore}
      />
    </div>
  );
};

const FundingFeeItem: FC<{
  item: any;
}> = ({ item }) => {
  const { t } = useTranslation();
  return (
    <div className="oui-flex oui-flex-col oui-space-y-2 oui-border-t oui-border-line-6 oui-py-2">
      <Flex justify={"between"}>
        <Statistic
          label={t("funding.fundingRate")}
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
          label={t("common.amount")}
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
          {item.payment_type === "Pay"
            ? t("funding.paymentType.paid")
            : t("funding.paymentType.received")}
        </Text>
      </Flex>
    </div>
  );
};
