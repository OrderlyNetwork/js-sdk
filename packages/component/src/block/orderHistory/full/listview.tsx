import { FC, useMemo, useRef } from "react";
import { Table } from "@/table";
import { OrderStatus, OrderSide, API, OrderType } from "@orderly.network/types";
import { cx } from "class-variance-authority";
import { upperCaseFirstLetter } from "@/utils/string";
import { SymbolProvider } from "@/provider";
import { cn } from "@/utils";
import { columnsBasis } from "@/block/orders/columnsUtil";
import { OrderTrades } from "../orderTrades";
import { PositionEmptyView } from "@/block/positions/full/positionEmptyView";
import { NumeralWithCtx } from "@/text/numeralWithCtx";

interface Props {
  dataSource: API.OrderExt[];
  loading?: boolean;
  loadMore?: () => void;
  className?: string;
  //   status: OrderStatus;
  //   onCancelOrder?: (orderId: number, symbol: string) => Promise<any>;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const Listview: FC<Props> = (props) => {
  const columns = useMemo(() => {
    const cols = columnsBasis({ onSymbolChange: props.onSymbolChange });

    cols[2] = {
      title: "Side",
      className: "orderly-h-[48px]",
      width: 100,
      dataIndex: "side",
      render: (value: string, record: any) => {
        const status = record.status || record.algo_status;

        return (
          <span
            className={cx("orderly-font-semibold", {
              "orderly-text-trade-profit":
                status !== OrderStatus.CANCELLED &&
                status !== OrderStatus.REJECTED &&
                value === OrderSide.BUY,
              "orderly-text-trade-loss":
                status !== OrderStatus.CANCELLED &&
                status !== OrderStatus.REJECTED &&
                value === OrderSide.SELL,
            })}
          >
            {upperCaseFirstLetter(value)}
          </span>
        );
      },
    };

    cols[3] = {
      title: "Filled / Quantity",
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "quantity",
      width: 200,
      render: (value: string, record: any) => {
        if (
          record.type === OrderType.CLOSE_POSITION &&
          record.status !== OrderStatus.FILLED
        ) {
          return "Entire position";
        }
        const status = record.status || record.algo_status;
        return (
          <span
            className={cx("orderly-font-semibold", {
              "orderly-text-trade-profit":
                status !== OrderStatus.CANCELLED &&
                status !== OrderStatus.REJECTED &&
                record.side === OrderSide.BUY,
              "orderly-text-trade-loss":
                status !== OrderStatus.CANCELLED &&
                status !== OrderStatus.REJECTED &&
                record.side === OrderSide.SELL,
            })}
          >{`${record.total_executed_quantity} / ${record.quantity}`}</span>
        );
      },
    };

    // realized_pnl

    cols.splice(7, 0, {
      title: "Realized PnL",
      width: 100,
      className: "orderly-h-[48px] orderly-font-semibold",
      dataIndex: "realized_pnl",
      render: (value: string, record: any) => {
        if (
          record.type === OrderType.CLOSE_POSITION &&
          record.status !== OrderStatus.FILLED
        ) {
          return "Entire position";
        }

        return (
          <NumeralWithCtx
            className={cn("orderly-font-semibold orderly-text-2xs", record.realized_pnl === 0 ? "" : (record.realized_pnl > 0
              ? "orderly-text-trade-profit"
              : "orderly-text-trade-loss"))}
            tick="quote_dp"
            
            rule="price"
          >
            {record.realized_pnl === 0 ||
            Number.isNaN(record.realized_pnl) ||
            record.realized_pnl === null
              ? "-"
              : `${record.realized_pnl}`}
          </NumeralWithCtx>
        );
      },
    });

    return cols;
  }, []);

  const divRef = useRef<HTMLDivElement>(null);

  return (
    <div ref={divRef} className="orderly-h-full orderly-overflow-y-auto">
      <Table<API.AlgoOrder | API.Order>
        bordered
        justified
        showMaskElement={props.loading}
        columns={columns}
        loading={props.loading}
        dataSource={props.dataSource}
        loadMore={props.loadMore}
        headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
        className={cn(
          "orderly-text-2xs orderly-text-base-contrast-80",
          props.className
        )}
        generatedRowKey={(record, index) =>
          `${index}${(record as API.Order).order_id || record.algo_order_id}`
        }
        onRow={(record) => {
          if (
            (record as API.Order).status === OrderStatus.CANCELLED ||
            (record as API.AlgoOrder).algo_status === OrderStatus.CANCELLED
          ) {
            return {
              className: "orderly-text-base-contrast-20",
              "data-cancelled": "true",
            };
          }
          return {};
        }}
        renderRowContainer={(record, index, children) => {
          return (
            <SymbolProvider
              key={index}
              symbol={record.symbol}
              children={children}
            />
          );
        }}
        expandRowRender={(record, index) => {
          return <OrderTrades record={record} index={index} />;
        }}
      />

      {/* {(!props.dataSource ||
        (props.dataSource.length <= 0 && !props.loading)) && (
        <PositionEmptyView watchRef={divRef} left={0} right={120} />
      )} */}
    </div>
  );
};
