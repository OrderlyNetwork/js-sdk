import React, { useMemo } from "react";
import { Column, Table } from "@/table";
import { Numeral, Text } from "@/text";
import { usePrivateQuery } from "@orderly.network/hooks";
import { Tooltip } from "@/tooltip";
import { NetworkImage } from "@/icon";

function formatTxID(value?: string) {
  if (value === undefined || value === null) return "";
  if (value.length < 10) return value;
  return `${value.slice(0, 5)}...${value.slice(-5)}`;
}

function formatStatus(status: string) {
  if (!status) {
    return status;
  }
  return status.charAt(0).toUpperCase() + status.slice(1).toLowerCase();
}

const AssetHistory: React.FC = (props) => {
  const { data, isLoading } = usePrivateQuery<any[]>("/v1/asset/history");

  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Token",
        dataIndex: "token",
        render(value, record, index) {
          return (
            <div className=" orderly-flex orderly-items-center">
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
              className="orderly-text-base-contrast-80 orderly-text-3xs"
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
              {formatStatus(value)}
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
              {value}
            </div>
          );
        },
      },

      {
        title: "Amount",
        dataIndex: "amount",
        align: "right",
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

export default AssetHistory;
