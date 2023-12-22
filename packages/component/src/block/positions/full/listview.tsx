import { Table } from "@/table";
import { FC, useContext, useMemo } from "react";
import { PositionsViewProps } from "@/block";
import { Numeral, Text } from "@/text";
import { PositionsRowProvider } from "./positionRowContext";
import { PriceInput } from "./priceInput";
import { CloseButton } from "./closeButton";
import { SymbolProvider } from "@/provider";
import { QuantityInput } from "./quantityInput";
import { NumeralWithCtx } from "@/text/numeralWithCtx";
import { TabContext } from "@/tab";

export const Listview: FC<PositionsViewProps> = (props) => {
  const { height } = useContext(TabContext);
  const columns = useMemo(() => {
    return [
      {
        title: "Instrument",
        dataIndex: "symbol",
        className: "orderly-h-[48px]",
        render: (value: string) => <Text rule={"symbol"} className="orderly-font-semibold">{value}</Text>,
      },
      {
        title: "Quantity",
        className: "orderly-h-[48px]",
        dataIndex: "position_qty",
        render: (value: string) => (
          <NumeralWithCtx coloring className="orderly-font-semibold">{value}</NumeralWithCtx>
        ),
      },
      {
        title: "Avg.open",
        className: "orderly-h-[48px]",
        dataIndex: "average_open_price",
      },
      {
        title: "Mark price",
        dataIndex: "mark_price",
        className: "orderly-h-[48px]",
        render: (value: string) => {
          return <Numeral className="orderly-font-semibold">{value}</Numeral>;
        },
      },
      {
        title: "Liq.price",
        className: "orderly-h-[48px]",
        dataIndex: "est_liq_price",
        render: (value: string) => {
          return Number(value) === 0 ? (
            "--"
          ) : (
            <Numeral className="orderly-text-warning orderly-font-semibold">{value}</Numeral>
          );
        },
      },
      {
        title: "Margin",
        className: "orderly-h-[48px]",
        dataIndex: "mm",
        render: (value: string) => <Numeral className="orderly-font-semibold">{value}</Numeral>,
      },
      {
        title: "Unreal.PnL",
        className: "orderly-h-[48px]",
        dataIndex: "unrealized_pnl",
        render: (value: string) => <Numeral coloring className="orderly-font-semibold">{value}</Numeral>,
      },
      // {
      //   title: "Daily real.",
      //   className: "orderly-h-[48px]",
      //   dataIndex: "open_price",
      // },
      {
        title: "Notional",
        dataIndex: "notional",
        className: "orderly-h-[48px]",
        render: (value: string) => <Numeral className="orderly-font-semibold">{value}</Numeral>,
      },
      {
        title: "Qty.",
        dataIndex: "close_qty",
        className: "orderly-w-[100px] orderly-h-[48px]",
        render: (value: string) => {
          return <QuantityInput />;
        },
      },
      {
        title: "Price",
        dataIndex: "close_price",
        className: "orderly-w-[100px] orderly-h-[48px]",
        render: (value: string) => <PriceInput />,
      },
      {
        title: "",
        dataIndex: "close_position",
        align: "right",
        className: "orderly-w-[80px] orderly-h-[48px]",
        render: (value: string) => {
          return <CloseButton />;
        },
      },
    ];
  }, []);

  return (
    <div
      className="orderly-overflow-y-auto"
      style={{ height: `${(height?.content ?? 100) - 68}px` }}
    >
      <Table
        bordered
        justified
        columns={columns}
        dataSource={props.dataSource}
        headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
        className={"orderly-text-2xs orderly-text-base-contrast-80 orderly-min-w-[1100px] orderly-overflow-x-auto"}
        generatedRowKey={(record) => record.symbol}
        renderRowContainer={(record, index, children) => {
          return (
            <SymbolProvider symbol={record.symbol}>
              <PositionsRowProvider position={record}>
                {children}
              </PositionsRowProvider>
            </SymbolProvider>
          );
        }}
      />
    </div>
  );
};
