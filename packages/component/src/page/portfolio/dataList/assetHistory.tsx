import React, { useMemo, useRef } from "react";
import { Column, Table } from "@/table";
import { Numeral, Text } from "@/text";
import { useAccount, usePrivateInfiniteQuery } from "@orderly.network/hooks";
import { Tooltip } from "@/tooltip";
import { NetworkImage } from "@/icon";
import {
  formatTxID,
  generateKeyFun,
  getInfiniteData,
  upperFirstLetter,
} from "../utils";
import { useEndReached } from "@/listView/useEndReached";
import { AccountStatusEnum } from "@orderly.network/types";
import { cn } from "@/utils";

type AssetHistoryProps = {};

const AssetHistory: React.FC<AssetHistoryProps> = (props) => {
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const { state } = useAccount();

  const { data, size, setSize, isLoading } = usePrivateInfiniteQuery(
    generateKeyFun("/v1/asset/history", { size: 100 }),
    {
      initialSize: 1,
      formatter: (data) => data,
      revalidateOnFocus: false,
    }
  );

  const dataSource = useMemo(() => {
    if (state.status < AccountStatusEnum.EnableTrading) {
      return [];
    }
    return getInfiniteData(data);
  }, [state, data]);

  useEndReached(sentinelRef, () => {
    if (!isLoading) {
      setSize(size + 1);
    }
  });

  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Token",
        dataIndex: "token",
        render(value, record, index) {
          return (
            <div className="orderly-flex orderly-items-center orderly-text-base-contrast-80">
              <NetworkImage type={"token"} name={value} size="small" rounded />
              <div className="orderly-ml-[6px]">{value}</div>
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
        title: "TxID",
        dataIndex: "tx_id",
        render(value, record, index) {
          return (
            <Tooltip content={value}>
              <span className="orderly-text-base-contrast-54 orderly-border-b-[1px] orderly-border-dashed orderly-border-base-contrast-54">
                {formatTxID(value)}
              </span>
            </Tooltip>
          );
        },
      },
      {
        title: "Status",
        dataIndex: "trans_status",
        render(value, record, index) {
          const isEnd = ["COMPLETED", "CANCELED", "FAILED"];
          return (
            <div
              className={
                isEnd
                  ? "orderly-text-base-contrast-54"
                  : "orderly-text-base-contrast-98"
              }
            >
              {upperFirstLetter(value)}
            </div>
          );
        },
      },
      {
        title: "Type",
        dataIndex: "side",
        render(value, record, index) {
          return (
            <div
              className={
                value === "DEPOSIT"
                  ? "orderly-text-success-light"
                  : "orderly-text-danger-light"
              }
            >
              {upperFirstLetter(value)}
            </div>
          );
        },
      },

      {
        title: "Amount",
        dataIndex: "amount",
        align: "right",
        className: "orderly-w-[120px]",
        render(value, record, index) {
          const isDeposit = record.side === "DEPOSIT";
          return (
            <div
              className={
                isDeposit
                  ? "orderly-text-success-light"
                  : "orderly-text-danger-light"
              }
            >
              {isDeposit ? "+" : "-"}
              <Numeral
              // precision={base_dp}
              >
                {Math.abs(value)}
              </Numeral>
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <div className="orderly-overflow-y-auto orderly-h-[100vh] orderly-pb-[300px]">
      <Table
        dataSource={dataSource}
        columns={columns}
        loading={isLoading}
        className="orderly-text-2xs orderly-min-h-[300px]"
        headerClassName={cn(
          "orderly-h-[40px] orderly-text-base-contrast-54 orderly-bg-base-900",
          "orderly-border-b orderly-border-b-divider"
        )}
        generatedRowKey={(record) => record.id}
        onRow={(record) => ({
          className:
            "orderly-h-[40px] orderly-border-b-[1px] orderly-border-b-solid orderly-border-[rgba(255,255,255,0.04)]",
        })}
      />
      <div
        ref={sentinelRef}
        className="orderly-relative orderly-invisible orderly-h-[1px] orderly-top-[-300px]"
      />
    </div>
  );
};

export default AssetHistory;
