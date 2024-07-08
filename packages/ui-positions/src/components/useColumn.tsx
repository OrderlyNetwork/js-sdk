import { Column, Text } from "@orderly.network/ui";
import { useMemo } from "react";

export const useColumn = () => {
  const column = useMemo<Column[]>(
    () => [
      {
        title: "Instrument",
        dataIndex: "symbol",
        fixed: "left",
        width: 120,
        onSort: (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r1.symbol.localeCompare(r2.symbol);
          }
          return r2.symbol.localeCompare(r1.symbol);
        },
        render: (value: string) => (
          <Text.formatted
            rule={"symbol"}
            onClick={(e) => {
              // props.onSymbolChange?.({ symbol: value } as API.Symbol);
              // e.stopPropagation();
              // e.preventDefault();
            }}
          >
            {value}
          </Text.formatted>
        ),
      },
      {
        title: "Quantity",
        dataIndex: "position_qty",
        onSort: true,
        width: 100,
        // render: (value: string) => (
        //   <NumeralWithCtx
        //     coloring
        //     className="orderly-font-semibold"
        //     tick="base_dp"
        //   >
        //     {value}
        //   </NumeralWithCtx>
        // ),
      },
      {
        title: "Avg. open",
        className: "orderly-h-[48px]",
        width: 120,
        onSort: true,
        dataIndex: "average_open_price",
        // render: (value: string) => <NumeralWithCtx>{value}</NumeralWithCtx>,
      },
      {
        title: "Mark price",
        dataIndex: "mark_price",
        width: 120,
        onSort: true,
        className: "orderly-h-[48px]",

        // render: (value: string) => {
        //   return (
        //     <NumeralWithCtx className="orderly-font-semibold">
        //       {value}
        //     </NumeralWithCtx>
        //   );
        // },
      },
      {
        title: "Liq. price",
        width: 100,
        onSort: true,
        hint: "Estimated price at which your position will be liquidated. Prices are estimated and depend on multiple factors across all positions.",
        dataIndex: "est_liq_price",
        // render: (value: string) => {
        //   return Number(value) === 0 ? (
        //     "--"
        //   ) : (
        //     <NumeralWithCtx className="orderly-text-warning orderly-font-semibold">
        //       {value}
        //     </NumeralWithCtx>
        //   );
        // },
      },
      {
        title: "Unreal. PnL",
        dataIndex: "unrealized_pnl",
        width: 150,
        onSort: true,
        // hint: (
        //   <UnrealizedPnLPopoverCard
        //     unPnlPriceBasis={props.unPnlPriceBasis}
        //     setUnPnlPriceBasic={props.setUnPnlPriceBasic}
        //   />
        // ),
        // render: (value: string, record: any) => {
        //   return (
        //     <span>
        //       <Numeral
        //         precision={pnlNotionalDecimalPrecision}
        //         coloring
        //         className="orderly-font-semibold"
        //       >
        //         {value}
        //       </Numeral>
        //       {
        //         <Numeral
        //           rule="percentages"
        //           precision={pnlNotionalDecimalPrecision}
        //           coloring
        //           className="orderly-font-semibold"
        //           prefix="("
        //           surfix=")"
        //         >
        //           {record.unrealized_pnl_ROI}
        //         </Numeral>
        //       }
        //       <SharePnLIcon className="orderly-ml-2" position={record} />
        //     </span>
        //   );
        // },
      },
      {
        title: "TP/SL",
        dataIndex: "__",
        width: 150,
        // render: (_: string, record) => (
        //   <TriggerPrice
        //     stopLossPrice={record.sl_trigger_price}
        //     takeProfitPrice={record.tp_trigger_price}
        //   />
        // ),
      },

      {
        title: "Est. total",
        dataIndex: "notional",
        className: "orderly-h-[48px]",
        width: 100,
        onSort: true,
        // render: (value: string) => (
        //   <Numeral
        //     precision={pnlNotionalDecimalPrecision}
        //     className="orderly-font-semibold"
        //   >
        //     {value}
        //   </Numeral>
        // ),
      },
      {
        title: "Margin",
        dataIndex: "mm",
        onSort: true,
        width: 100,
        // render: (value: string) => (
        //   <Numeral className="orderly-font-semibold">{value}</Numeral>
        // ),
        // hint: (
        //   <div>
        //     <span>The minimum equity to keep your position. </span>
        //     <Divider className="orderly-py-2 orderly-border-white/10" />
        //     <span>Margin = Position size * Mark price * MMR</span>
        //   </div>
        // ),
        hintClassName: "orderly-p-2",
      },
      {
        title: "Qty.",
        dataIndex: "close_qty",
        width: 100,
        fixed: "right",
        // render: (value: string) => {
        //   return <QuantityInput />;
        // },
      },
      {
        title: "Price",
        dataIndex: "close_price",
        width: 100,
        fixed: "right",
        // render: (value: string) => <PriceInput />,
      },
      {
        title: "",
        dataIndex: "close_position",
        align: "right",
        width: 160,
        fixed: "right",
        // render: (value: string) => {
        //   return (
        //     <div className="orderly-flex orderly-space-x-2">
        //       <CloseButton />
        //       <TPSLButton />
        //     </div>
        //   );
        // },
      },
    ],
    []
  );

  return column;
};
