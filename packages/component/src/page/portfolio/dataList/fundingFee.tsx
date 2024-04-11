import React, { useMemo, useRef } from "react";
import { Column, Table } from "@/table";
import { Numeral, Text } from "@/text";
import {
  usePrivateInfiniteQuery,
  useSymbolsInfo,
} from "@orderly.network/hooks";
import { NetworkImage } from "@/icon";
import { Decimal } from "@orderly.network/utils";
import { generateKeyFun, getAnnualRate, getInfiniteData } from "../utils";
import { useEndReached } from "@/listView/useEndReached";

const FundingFee: React.FC = () => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const symbolInfo = useSymbolsInfo();

  const { data, size, setSize, isLoading } = usePrivateInfiniteQuery(
    generateKeyFun("/v1/funding_fee/history", { size: 100 }),
    {
      initialSize: 1,
      formatter: (data) => data,
      revalidateOnFocus: false,
    }
  );

  const dataSource = useMemo(() => getInfiniteData(data), [data]);

  useEndReached(sentinelRef, () => {
    if (!isLoading) {
      setSize(size + 1);
    }
  });

  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Instrument",
        dataIndex: "symbol",
        render(value, record, index) {
          return (
            <div className=" orderly-flex orderly-items-center orderly-text-base-contrast-80">
              <NetworkImage type="symbol" symbol={value} size="small" rounded />
              <Text rule="symbol" className="orderly-ml-[6px]">
                {value}
              </Text>
            </div>
          );
        },
      },
      {
        title: "Time",
        dataIndex: "created_time",
        render(value, record, index) {
          return (
            <Text
              rule="date"
              formatString="YYYY-MM-DD HH:mm:ss"
              className="orderly-text-base-contrast-98 orderly-text-3xs"
            >
              {value}
            </Text>
          );
        },
      },
      {
        title: "Funding rate / Annual rate",
        dataIndex: "funding_rate",
        render(value, record, index) {
          const funding_period =
            symbolInfo?.[record.symbol]?.("funding_period");
          const percent = new Decimal(value).mul(100).toFixed(6);
          const annualRate = getAnnualRate(value, funding_period);
          return (
            <div className="orderly-text-base-contrast-80">{`${percent}% / ${annualRate}%`}</div>
          );
        },
      },
      {
        title: "Payment type",
        dataIndex: "payment_type",
        render(value, record, index) {
          const map: any = {
            Pay: "Paid",
            Receive: "Received",
          };
          return (
            <div className="orderly-text-base-contrast-80">
              {map[value] || value}
            </div>
          );
        },
      },

      {
        title: "Funding fee",
        dataIndex: "funding_fee",
        align: "right",
        render(value, record, index) {
          const isReceived = record.payment_type === "Receive";
          return (
            <div
              className={
                isReceived
                  ? "orderly-text-success-light"
                  : "orderly-text-danger-light"
              }
            >
              {isReceived ? "+" : "-"}
              <Numeral precision={8}>{Math.abs(value)}</Numeral>
              <Text
                rule="symbol"
                symbolElement="quote"
                className="orderly-text-base-contrast-36 orderly-ml-[4px]"
              >
                {record.symbol}
              </Text>
            </div>
          );
        },
      },
    ];
  }, [symbolInfo]);

  return (
    <div className="orderly-overflow-y-auto orderly-h-[100vh] orderly-pb-[50px]">
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={isLoading}
        className="orderly-text-2xs orderly-min-h-[300px]"
        headerClassName="orderly-h-[40px] orderly-text-base-contrast-54 orderly-border-b-[1px] orderly-border-b-solid orderly-border-[rgba(255,255,255,0.04)] orderly-bg-base-900"
        generatedRowKey={(record) => record.id}
        onRow={(record) => ({
          className: "orderly-h-[50px]",
        })}
      />
      <div
        ref={sentinelRef}
        className="orderly-relative orderly-invisible orderly-h-[1px] orderly-top-[-300px]"
      />
    </div>
  );
};

export default FundingFee;
