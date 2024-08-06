import { API, OrderSide, OrderStatus } from "@orderly.network/types";
import { Box, Button, cn, Column, Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useMemo } from "react";
import { upperCaseFirstLetter } from "../../utils/util";
import { TabType } from "../orders.widget";

export const useOrderColumn = (_type: TabType) => {
  const columns = useMemo(() => {
    switch (_type) {
      case TabType.all:
        return [
          instrument({ showType: true }),
          side(),
          fillAndQuantity(),
          price(),
          avgOpen(),
          triggerPrice(),
          estTotal(),
          fee(),
          status(),
          reduce(),
          hidden(),
          cancelBtn(),
        ];
      case TabType.pending:
        return [
          instrument({ showType: true }),
          side(),
          fillAndQuantity(),
          price(),
          avgOpen(),
          triggerPrice(),
          estTotal(),
          reduce(),
          hidden(),
          orderTime(),
          cancelBtn(),
        ];
      case TabType.tp_sl:
        return [
          instrument({ showType: true }),
          side(),
          quantity(),
          triggerPrice(),
          price(),
          notional(),
          reduce(),
          orderTime(),
          cancelBtn(),
        ];
      case TabType.filled:
        return [
          instrument(),
          type(),
          side(),
          fillAndQuantity(),
          price(),
          notional(),
          reduce(),
          orderTime(),
          cancelBtn(),
        ];
      case TabType.cancelled:
        return [
          instrument(),
          side(),
          fillAndQuantity(),
          price(),
          avgOpen(),
          triggerPrice(),
          estTotal(),
          fee(),
          status(),
          reduce(),
          hidden()
        ];
      case TabType.rejected:
        return [
          instrument(),
          side(),
          fillAndQuantity(),
          price(),
          avgOpen(),
          triggerPrice(),
          estTotal(),
          fee(),
          status(),
          reduce(),
          hidden(),
          orderTime(),
        ];
      case TabType.orderHistory:
        return [
          instrument(),
          side(),
          fillAndQuantity(),
          price(),
          avgOpen(),
          triggerPrice(),
          estTotal(),
          fee(),
          status(),
          reduce(),
          hidden(),
          orderTime(),
        ];
    }
  }, [_type]);

  return columns;
};

function instrument(option?: {
  showType?: boolean;
  enableSort?: boolean;
}): Column<API.Order> {
  return {
    title: "Instrument",
    dataIndex: "symbol",
    className: "orderly-h-[48px]",
    width: 120,
    onSort: option?.enableSort
      ? (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r1.symbol.localeCompare(r2.symbol);
          }
          return r2.symbol.localeCompare(r1.symbol);
        }
      : undefined,
    render: (value: string, record) => {
      const type =
        typeof record.type === "string"
          ? record.type.replace("_ORDER", "").toLowerCase()
          : record.type;
      if (record.algo_order_id) {
        return `Stop ${type}`;
      }

      return (
        <Flex direction="column">
          <Text.formatted
            rule={"symbol"}
            className="orderly-font-semibold"
            onClick={(e) => {
              // props.onSymbolChange?.({ symbol: value } as API.Symbol);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {value}
          </Text.formatted>
          {option?.showType && (
            <Box r="base" className="oui-bg-base-5">
              <Text>{upperCaseFirstLetter(type)}</Text>
            </Box>
          )}
        </Flex>
      );
    },
  };
}

function side(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Side",
    width: option?.width,
    className: "orderly-h-[48px]",
    dataIndex: "side",
    onSort: option?.enableSort
      ? (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r2.side.localeCompare(r1.side);
          }
          return r1.side.localeCompare(r2.side);
        }
      : undefined,
    render: (value: string) => (
      <span
        className={cn(
          "orderly-font-semibold",
          value === OrderSide.BUY
            ? "orderly-text-trade-profit"
            : "orderly-text-trade-loss"
        )}
      >
        {upperCaseFirstLetter(value)}
      </span>
    ),
  };
}

function type(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Type",
    width: option?.width,
    className: option?.className,
    dataIndex: "type",
    formatter: (value: string, record: any) => {
      const type =
        typeof record.type === "string"
          ? record.type.replace("_ORDER", "").toLowerCase()
          : record.type;
      if (record.algo_order_id) {
        return `Stop ${type}`;
      }
      return upperCaseFirstLetter(value);
    },
  };
}

function fillAndQuantity(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Filled / Quantity",
    className: option?.className,
    dataIndex: "quantity",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => {
      // return <OrderQuantity order={record} />;
      return value;
    },
  };
}

function quantity(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Quantity",
    className: option?.className,
    dataIndex: "quantity",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => {
      // return <OrderQuantity order={record} />;
      return value;
    },
  };
}

function price(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Price",
    className: option?.className,
    dataIndex: "price",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => {
      // return (<Price order={record} />);
      return value;
    },
  };
}

function triggerPrice(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Trigger",
    className: option?.className,
    dataIndex: "trigger_price",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) =>
      // <TriggerPrice order={record} />
      value,
  };
}

function estTotal(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Est. total",
    width: option?.width,
    className: option?.className,
    dataIndex: "executed",
    onSort: option?.enableSort,
    render: (value: string, record: any) => {
      return (
        <Text.numeral size="2xs" dp={2} rm={Decimal.ROUND_DOWN}>
          {record.quantity === 0 ||
          Number.isNaN(record.price) ||
          record.price === null
            ? "--"
            : `${record.quantity * record.price}`}
        </Text.numeral>
      );
    },
  };
}

function reduce(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Reduce",
    dataIndex: "reduce_only",
    width: option?.width,
    className: option?.className,
    render: (value: boolean) => {
      return <Text>{value ? "Yes" : "No"}</Text>;
    },
  };
}

function hidden(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Hidden",
    dataIndex: "visible",
    width: option?.width,
    className: option?.className,
    render: (value: number, record) => {
      return <Text>{record.visible_quantity !== 0 ? "No" : "Yes"}</Text>;
    },
  };
}

function orderTime(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  formatString?: string;
}): Column<API.Order> {
  return {
    title: "Order time",
    dataIndex: "created_time",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: string) => (
      <Text.formatted
        rule={"date"}
        formatString={option?.formatString || "yyyy-MM-dd HH:mm:ss"}
        className="orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold"
      >
        {value}
      </Text.formatted>
    ),
  };
}

function fee(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  formatString?: string;
}): Column<API.Order> {
  return {
    title: "Fee",
    dataIndex: "fee",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: string) => (
      <Text className="orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold">
        {value}
      </Text>
    ),
  };
}

function notional(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  formatString?: string;
}): Column<API.Order> {
  return {
    title: "Notional",
    dataIndex: "notional",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: string) => (
      <Text className="orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold">
        {value}
      </Text>
    ),
  };
}

function status(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  formatString?: string;
}): Column<API.Order> {
  return {
    title: "Status",
    dataIndex: "status",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: string) => (
      <Text className="orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold">
        {value}
      </Text>
    ),
  };
}

function avgOpen(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  formatString?: string;
}): Column<API.Order> {
  return {
    title: "Avg. open",
    dataIndex: "status",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: string) => (
      <Text className="orderly-break-normal orderly-whitespace-nowrap orderly-font-semibold">
        {value}
      </Text>
    ),
  };
}

function cancelBtn(option?: {
  width?: number;
  className?: string;
  formatString?: string;
}): Column<API.Order> {
  return {
    title: "",
    dataIndex: "",
    width: option?.width,
    className: option?.className,
    render: (value: string) => <Button variant="outlined">Cancel</Button>,
  };
}
