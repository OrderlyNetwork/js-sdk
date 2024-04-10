import React, { useMemo } from "react";
import { Column, Table } from "@/table";
import { Numeral, Text } from "@/text";
import { usePrivateQuery, useSymbolsInfo } from "@orderly.network/hooks";
import { NetworkImage } from "@/icon";
import { Decimal } from "@orderly.network/utils";

const FundingFee: React.FC = (props) => {
  const symbolInfo = useSymbolsInfo();
  const { data, isLoading } = usePrivateQuery<any[]>("/v1/funding_fee/history");

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
            symbolInfo?.[record.symbol]?.("funding_period") ?? 1;
          // const annualRate = new BigNumber(row.fundingRate)
          //     .multipliedBy(new BigNumber(24).div(new BigNumber(symbolInfo('funding_period') ?? 0)))
          //     .multipliedBy(365)
          //     .multipliedBy(100)
          //     .decimalPlaces(2)
          //     .toFixed();
          const annualRate = new Decimal(value)
            .mul(new Decimal(24).div(new Decimal(funding_period)))
            .mul(365)
            .mul(100)
            .toFixed(2);
          const percent = new Decimal(value).mul(100).toFixed(6);
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
          const split = record.symbol?.split("_");
          const token = split?.[split?.length - 1];
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
              <span className="orderly-text-base-contrast-36 orderly-ml-[4px]">
                {token}
              </span>
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <Table
      dataSource={data}
      columns={columns}
      loading={isLoading}
      className="orderly-text-2xs"
      headerClassName="orderly-h-[40px] orderly-text-base-contrast-54 orderly-border-b-[1px] orderly-border-b-solid orderly-border-[rgba(255,255,255,0.04)]"
      generatedRowKey={(record) => record.id}
      onRow={(record) => ({
        className: "orderly-h-[50px]",
      })}
    />
  );
};

export default FundingFee;
