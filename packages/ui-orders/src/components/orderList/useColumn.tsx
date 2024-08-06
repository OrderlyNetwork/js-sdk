import { API, OrderSide, OrderStatus, OrderType } from "@orderly.network/types";
import { Box, Button, cn, Column, Flex, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { useMemo } from "react";
import { grayCell, parseBadgesFor, upperCaseFirstLetter } from "../../utils/util";
import { TabType } from "../orders.widget";
import { Badge } from "@orderly.network/ui";
import { OrderQuantity } from "./quantity";
import { Price } from "./price";
import { TriggerPrice } from "./triggerPrice";
import { CancelButton } from "./cancelBtn";
import { Renew } from "./renew";

export const useOrderColumn = (_type: TabType) => {
  const columns =
    // useMemo(
    () => {
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
            instrument({ showType: true, width: 124 }),
            side({ width: 124 }),
            fillAndQuantity({ width: 124, disableEdit: true }),
            price({ width: 124, disableEdit: true }),
            avgOpen({ width: 124 }),
            triggerPrice({ width: 124, disableEdit: true }),
            estTotal({ width: 124 }),
            fee({ width: 124 }),
            status({ width: 124 }),
            reduce({ width: 124 }),
            hidden({ width: 124 }),
          ];
        case TabType.rejected:
          return [
            instrument({ showType: true, width: 124 }),
            side({ width: 124 }),
            fillAndQuantity({ width: 124, disableEdit: true }),
            price({ width: 124, disableEdit: true }),
            avgOpen({ width: 124 }),
            triggerPrice({ width: 124, disableEdit: true }),
            estTotal({ width: 124 }),
            fee({ width: 124 }),
            status({ width: 124 }),
            reduce({ width: 124 }),
            hidden({ width: 124 }),
            orderTime({ width: 124 }),
          ];
        case TabType.orderHistory:
          return [
            instrument({ showType: true, width: 124 }),
            side({ width: 124 }),
            fillAndQuantity({ width: 124, disableEdit: true }),
            price({ width: 124, disableEdit: true }),
            avgOpen({ width: 124 }),
            triggerPrice({ width: 124, disableEdit: true }),
            estTotal({ width: 124 }),
            fee({ width: 124 }),
            status({ width: 124 }),
            reduce({ width: 124 }),
            hidden({ width: 124 }),
            orderTime({ width: 124 }),
            cancelBtn({ width: 124 }),
          ];
      }
    };

  // }, [_type]);

  return columns();
};

function instrument(option?: {
  showType?: boolean;
  enableSort?: boolean;
  width?: number;
}): Column<API.Order> {
  return {
    title: "Instrument",
    dataIndex: "symbol",
    className: "oui-h-[48px]",
    width: option?.width,
    onSort: option?.enableSort
      ? (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r1.symbol.localeCompare(r2.symbol);
          }
          return r2.symbol.localeCompare(r1.symbol);
        }
      : undefined,
    render: (value: string, record) => {
      const badge =
        typeof record.type === "string"
          ? record.type.replace("_ORDER", "").toLowerCase()
          : record.type;
      console.log("xxxxxx badge", badge, record, record.type);
  
      const showGray = grayCell(record);

      return (
        <Flex direction="column" itemAlign={"start"}>
          <Text.formatted
            rule={"symbol"}
            size="xs"
            className=" oui-text-xs"
            onClick={(e) => {
              // props.onSymbolChange?.({ symbol: value } as API.Symbol);
              e.stopPropagation();
              e.preventDefault();
            }}
          >
            {value}
          </Text.formatted>
          {option?.showType && (
            <Flex direction={"row"} gap={1}>
              {parseBadgesFor(record)?.map((e) => (
                <Badge
                  color={
                    e.toLocaleLowerCase() === "position"
                      ? showGray ? "neutural": "primary"
                      : "neutural"
                  }
                  size="xs"
                >
                  {e}
                </Badge>
              ))}
            </Flex>
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
    className: "oui-h-[48px]",
    dataIndex: "side",
    onSort: option?.enableSort
      ? (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r2.side.localeCompare(r1.side);
          }
          return r1.side.localeCompare(r2.side);
        }
      : undefined,
    render: (value: string, record) => {
      const clsName = grayCell(record) ? 'oui-text-base-contrast-20' : (value === OrderSide.BUY
        ? "oui-text-trade-profit"
        : "oui-text-trade-loss");
      return (
        <span
          className={cn(
            "oui-font-semibold",
            clsName,
          )}
        >
          {upperCaseFirstLetter(value)}
        </span>
      );
    },
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
  disableEdit?: boolean;
}): Column<API.Order> {
  return {
    title: "Filled / Quantity",
    className: option?.className,
    dataIndex: "quantity",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => {
      return <OrderQuantity order={record} disableEdit={option?.disableEdit} />;
      // return value;
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
      return <OrderQuantity order={record} />;
      // return value;
    },
  };
}

function price(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  disableEdit?: boolean;
}): Column<API.Order> {
  return {
    title: "Price",
    className: option?.className,
    dataIndex: "price",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => {
      return <Price order={record} disableEdit={option?.disableEdit} />;
    },
  };
}

function triggerPrice(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  disableEdit?: boolean;
}): Column<API.Order> {
  return {
    title: "Trigger",
    className: option?.className,
    dataIndex: "trigger_price",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => (
      <TriggerPrice order={record} disableEdit={option?.disableEdit} />
    ),
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
    render: (value: string, record: any) => {
      if (
        record.type === OrderType.CLOSE_POSITION &&
        record.status !== OrderStatus.FILLED
      ) {
        return "Entire position";
      }

      return (
        <Text.numeral rm={Decimal.ROUND_DOWN}>
          {record.total_executed_quantity === 0 ||
          Number.isNaN(record.average_executed_price) ||
          record.average_executed_price === null
            ? "--"
            : `${
                record.total_executed_quantity * record.average_executed_price
              }`}
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
        className="oui-break-normal oui-whitespace-nowrap oui-font-semibold"
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
}): Column<API.Order> {
  return {
    title: "Fee",
    dataIndex: "total_fee",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
  };
}

function notional(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Notional",
    dataIndex: "notional",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: string) => (
      <Text className="oui-break-normal oui-whitespace-nowrap oui-font-semibold">
        {value}
      </Text>
    ),
  };
}

function status(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Status",
    dataIndex: "status",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: string, record: any) => (
      <Text className="oui-break-normal oui-whitespace-nowrap oui-font-semibold">
        {record?.algo_status || record.status}
      </Text>
    ),
  };
}

function avgOpen(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Avg. open",
    dataIndex: "average_open_price",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: string) => (
      <Text.numeral className="oui-break-normal oui-whitespace-nowrap oui-font-semibold">
        {value}
      </Text.numeral>
    ),
  };
}

function cancelBtn(option?: {
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "",
    dataIndex: "",
    width: option?.width,
    className: option?.className,
    align: "right",
    render: (_: string, record: any) => {
      if (record.status === OrderStatus.CANCELLED) {
        return <Renew record={record} />;
      }

      if (
        record.status === OrderStatus.NEW ||
        record.algo_status === OrderStatus.NEW
      ) {
        return <CancelButton order={record} />;
      }

      return null;
    },
  };
}
