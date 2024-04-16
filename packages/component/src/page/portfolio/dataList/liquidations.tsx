import React, { useMemo } from "react";
import { Column, Table } from "@/table";
import { Numeral, Text } from "@/text";
import { usePrivateQuery } from "@orderly.network/hooks";
import { NetworkImage } from "@/icon";

function getData(data: any) {
  return data.positions_by_perp?.[0] || {};
}

const mockData = [
  {
    liquidation_id: 101,
    timestamp: 1663313562090,
    transfer_amount_to_insurance_fund: 123,
    positions_by_perp: [
      {
        abs_liquidator_fee: 1.152279,
        cost_position_transfer: 65.84448,
        liquidator_fee: 0.0175,
        position_qty: 41.6,
        symbol: "PERP_NEAR_USDC",
        transfer_price: 1.5828,
      },
    ],
  },
];

const Liquidations: React.FC = (props) => {
  const { data: fundings, isLoading } =
    usePrivateQuery<any[]>("/v1/liquidations");

  const columns = useMemo<Column[]>(() => {
    return [
      {
        title: "Instrument",
        dataIndex: "",
        render(value, record, index) {
          const { symbol } = getData(record);
          return (
            <div className=" orderly-flex orderly-items-center">
              <NetworkImage
                type="symbol"
                symbol={symbol}
                size="small"
                rounded
              />
              <Text rule="symbol" className="orderly-ml-[6px]">
                {symbol}
              </Text>
            </div>
          );
        },
      },
      {
        title: "Time",
        dataIndex: "timestamp",
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
        title: "Qty.",
        dataIndex: "",
        render(value, record, index) {
          const { position_qty } = getData(record);
          return <div>{position_qty}</div>;
        },
      },
      {
        title: "Price",
        dataIndex: "",
        render(value, record, index) {
          const { transfer_price } = getData(record);
          return (
            <div className="orderly-text-base-contrast-98">
              {transfer_price}
            </div>
          );
        },
      },
      {
        title: "Total value",
        dataIndex: "",
        render(value, record, index) {
          const { cost_position_transfer, symbol } = getData(record);
          return (
            <div className="orderly-text-base-contrast-98">
              {cost_position_transfer}
              <Text
                rule="symbol"
                symbolElement="quote"
                className="orderly-text-base-contrast-36 orderly-ml-[4px]"
              >
                {symbol}
              </Text>
            </div>
          );
        },
      },
      {
        title: "Liquidation fee",
        dataIndex: "",
        render(value, record, index) {
          const { liquidator_fee, symbol } = getData(record);
          return (
            <>
              {liquidator_fee}
              <Text
                rule="symbol"
                symbolElement="quote"
                className="orderly-text-base-contrast-36 orderly-ml-[4px]"
              >
                {symbol}
              </Text>
            </>
          );
        },
      },
      {
        title: "Transferred to insurance",
        dataIndex: "transfer_amount_to_insurance_fund",
        render(value, record, index) {
          const { symbol } = getData(record);

          return (
            <>
              {value}
              <Text
                rule="symbol"
                symbolElement="quote"
                className="orderly-text-base-contrast-36 orderly-ml-[4px]"
              >
                {symbol}
              </Text>
            </>
          );
        },
      },

      {
        title: "Total loss",
        dataIndex: "",
        align: "right",
        render(value, record, index) {
          const { liquidator_fee, symbol } = getData(record);

          const totalLoss =
            record.transfer_amount_to_insurance_fund + liquidator_fee;

          return (
            <div className="orderly-text-danger-light">
              {"-"}
              <Numeral>{Math.abs(totalLoss)}</Numeral>
              <Text
                rule="symbol"
                symbolElement="quote"
                className="orderly-text-base-contrast-36 orderly-ml-[4px]"
              >
                {symbol}
              </Text>
            </div>
          );
        },
      },
    ];
  }, []);

  return (
    <div className="orderly-h-[500px]">
      <Table
        dataSource={mockData}
        columns={columns}
        loading={isLoading}
        className="orderly-text-2xs orderly-text-base-contrast-80"
        headerClassName="orderly-h-[40px] orderly-text-base-contrast-54 orderly-border-b-[1px] orderly-border-b-solid orderly-border-[rgba(255,255,255,0.04)]"
        generatedRowKey={(record) => record.liquidation_id as any}
        onRow={(record) => ({
          className: "orderly-h-[50px]",
        })}
      />
    </div>
  );
};

export default Liquidations;
