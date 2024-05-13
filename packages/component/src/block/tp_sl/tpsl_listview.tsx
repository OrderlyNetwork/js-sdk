import {
  API,
  AlgoOrderRootType,
  OrderStatus,
  OrderSide,
} from "@orderly.network/types";
import { FC, useMemo } from "react";
import { Column, Table } from "@/table";
import { Numeral, Text } from "@/text";
import { upperCaseFirstLetter } from "@/utils/string";
import { cx } from "class-variance-authority";
import { OrderQuantity } from "@/block/orders/full/quantity";
import { CancelButton } from "./cancelButton";
import { cn } from "@/utils";
import { AlgoOrderBadge } from "./algoOrderTypeBadge";
import { TPSLTriggerPrice } from "@/block/positions/full/tpslTriggerPrice";
import Button from "@/button";
import { SymbolProvider } from "@/provider";
import {
  TPSLOrderRowProvider,
  useTPSLOrderRowContext,
} from "@/block/tp_sl/tpslOrderRowContext";
import { Decimal } from "@orderly.network/utils";
import { OrderPrice } from "./orderPrice";
import { OrderTriggerPrice } from "./orderTriggerPrice";
import { EditButton } from "./editButton";

interface Props {
  dataSource: any[];
  // status: OrderStatus;
  onCancelOrder?: (orderId: number, symbol: string) => Promise<any>;
  loading?: boolean;
  loadMore?: () => void;
  className?: string;
  onSymbolChange?: (symbol: API.Symbol) => void;
}

export const TPSLListView: FC<Props> = (props) => {
  const columns = useMemo(() => {
    const columns: Column<API.AlgoOrderExt>[] = [
      {
        title: "Instrument",
        dataIndex: "symbol",
        className: "orderly-h-[48px]",
        width: 120,
        onSort: (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r1.symbol.localeCompare(r2.symbol);
          }
          return r2.symbol.localeCompare(r1.symbol);
        },
        render: (value: string, record) => (
          <div className={"orderly-flex orderly-flex-col orderly-py-1"}>
            <Text
              rule={"symbol"}
              className="orderly-font-semibold"
              onClick={(e) => {
                props.onSymbolChange?.({ symbol: value } as API.Symbol);
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {value}
            </Text>
            <AlgoOrderBadge order={record} />
          </div>
        ),
      },

      {
        title: "Side",
        width: 100,
        className: "orderly-h-[48px]",
        dataIndex: "side",
        onSort: (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r2.side.localeCompare(r1.side);
          }
          return r1.side.localeCompare(r2.side);
        },
        render: (value: string) => (
          <span
            className={cx(
              "orderly-font-semibold",
              value === OrderSide.BUY
                ? "orderly-text-trade-profit"
                : "orderly-text-trade-loss"
            )}
          >
            {upperCaseFirstLetter(value)}
          </span>
        ),
      },
      {
        title: "Quantity",
        className:
          "orderly-h-[48px] orderly-ui-pending-list-input-container orderly-ui-pending-list-quantity-input-container",
        dataIndex: "quantity",
        width: 120,
        // onSort: props.status === OrderStatus.INCOMPLETE,
        render: (value: string, record: any) => {
          if (record.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
            return "Entire position";
          }
          return <OrderQuantity order={record} />;
        },
      },

      {
        title: "Trigger",
        className:
          "orderly-h-[48px] orderly-ui-pending-list-input-container orderly-ui-pending-list-trigger-input-container",
        dataIndex: "trigger_price",
        width: 120,
        // onSort: props.status === OrderStatus.INCOMPLETE,
        render: (value: string) => {
          return <OrderTriggerPrice />;
        },
      },
      {
        title: "Price",
        className:
          "orderly-h-[48px] orderly-ui-pending-list-input-container rderly-ui-pending-list-price-input-container",
        dataIndex: "price",
        width: 80,
        render: (value: string) => {
          return <OrderPrice />;
        },
      },
      {
        title: "Notional",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold",
        dataIndex: "executed",
        render: (value: string, record: API.AlgoOrderExt) => {
          if (record.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
            return "Entire position";
          }
          return (
            <Numeral
              className={
                "orderly-font-semibold orderly-text-2xs orderly-text-base-contrast-80"
              }
              precision={2}
            >
              {record.quantity === 0
                ? "--"
                : `${new Decimal(record.mark_price)
                    .mul(record.quantity)
                    .todp(2)
                    .toNumber()}`}
            </Numeral>
          );
        },
      },
      {
        title: "Reduce-only",
        dataIndex: "reduce_only",
        width: 100,
        className: "orderly-h-[48px] orderly-font-semibold",
        render: (value: boolean, record) => {
          return (
            <span>{record.child_orders[0].reduce_only ? "Yes" : "No"}</span>
          );
        },
      },
      // {
      //   title: "Hidden",
      //   dataIndex: "visible",
      //   width: 100,
      //   className: "orderly-h-[48px] orderly-font-semibold",
      //   render: (value: number, record) => {
      //     // @ts-ignore
      //     return <span>{record.visible_quantity !== 0 ? "No" : "Yes"}</span>;
      //   },
      // },
      {
        title: "Order time",
        dataIndex: "created_time",
        width: 150,
        onSort: true,
        className: "orderly-h-[48px]",
        render: (value: string) => (
          <Text
            rule={"date"}
            className="orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold"
          >
            {value}
          </Text>
        ),
      },
      {
        title: "",
        dataIndex: "action",
        className: "orderly-h-[48px]",
        align: "right",
        fixed: "right",
        width: 160,
        render: (_: string, record) => {
          return (
            <div className="orderly-flex orderly-space-x-2 orderly-justify-end">
              {/*<Button size="small" variant={"outlined"} color={"tertiary"}>*/}
              {/*  Edit*/}
              {/*</Button>*/}
              <EditButton />
              <CancelButton />
            </div>
          );
        },
      },
    ];

    // columns.push();

    return columns;
  }, []);

  return (
    <div className="orderly-h-full orderly-overflow-y-auto">
      <Table<API.AlgoOrderExt>
        id="orderly-desktop-order-tp_sl-content"
        bordered
        justified
        headerClassName="orderly-text-2xs orderly-text-base-contrast-54 orderly-py-3 orderly-bg-base-900"
        className={cn(
          "orderly-text-2xs orderly-text-base-contrast-80",
          props.className
        )}
        columns={columns}
        dataSource={props.dataSource}
        renderRowContainer={(record, index, children) => {
          return (
            <SymbolProvider symbol={record.symbol}>
              <TPSLOrderRowProvider order={record}>
                {children}
              </TPSLOrderRowProvider>
            </SymbolProvider>
          );
        }}
      />
    </div>
  );
};
