import {
  AlgoOrderRootType,
  API,
  OrderSide,
  OrderStatus,
  OrderType,
} from "@orderly.network/types";
import {
  Box,
  Button,
  capitalizeFirstLetter,
  cn,
  Column,
  Flex,
  Text,
} from "@orderly.network/ui";
import { commifyOptional, Decimal } from "@orderly.network/utils";
import { useMemo } from "react";
import {
  grayCell,
  parseBadgesFor,
  upperCaseFirstLetter,
} from "../../../utils/util";
import { TabType } from "../../orders.widget";
import { Badge } from "@orderly.network/ui";
import { OrderQuantity } from "./quantity";
import { Price } from "./price";
import { TriggerPrice } from "./triggerPrice";
import { CancelButton } from "./cancelBtn";
import { Renew } from "./renew";
import { OrderTriggerPrice, TPSLTriggerPrice } from "./tpslTriggerPrice";
import { BarcketOrderPrice } from "./barcketOrderPrice";
import { TP_SLEditButton } from "./tpslEdit";

export const useOrderColumn = (_type: TabType) => {
  const columns =
    // useMemo(
    () => {
      switch (_type) {
        case TabType.all:
          return [
            instrument({ width: 130, showType: true }),
            side({ width: 130 }),
            fillAndQuantity({
              width: 130,
              disableEdit: true,
              className: "oui-pl-0 oui-pr-0",
            }),
            price({ width: 130, title: "Order price", disableEdit: true }),
            avgOpen({ width: 130 }),
            tpslTriggerPrice({ width: 130 }),
            estTotal({ width: 130 }),
            fee({ width: 130 }),
            status({ width: 130 }),
            reduceOnly({ width: 130 }),
            hidden({ width: 130 }),
            cancelBtn({ width: 130 }),
          ];
        case TabType.pending:
          return [
            instrument({ width: 162, showType: true }),
            side({ width: 162 }),
            fillAndQuantity({ width: 162, className: "oui-pr-0" }),
            price({ width: 162, className: "oui-pr-0" }),
            triggerPrice({ width: 162, className: "oui-pr-0" }),
            barcketOrderPrice({ width: 130 }),
            estTotal({ width: 162 }),
            reduceOnly({ width: 162 }),
            hidden({ width: 162 }),
            orderTime({ width: 162 }),
            cancelBtn({ width: 162 }),
          ];
        case TabType.tp_sl:
          return [
            instrument({ width: 176, showType: true }),
            side({ width: 176 }),
            quantity({ width: 176 }),
            tpslTriggerPrice({ width: 176 }),
            price({ width: 176, disableEdit: true }),
            notional({ width: 176 }),
            reduceOnly({ width: 176 }),
            orderTime({ width: 176 }),
            tpslAction({ width: 176 }),
          ];
        case TabType.filled:
          return [
            instrument({ width: 124 }),
            type({ width: 124 }),
            side({ width: 124 }),
            fillAndQuantity({
              width: 124,
              disableEdit: true,
              className: "oui-pl-0 oui-pr-0",
            }),
            price({ width: 124, title: "Order price", disableEdit: true }),
            avgPrice({ width: 124 }),
            triggerPrice({ width: 124, disableEdit: true }),
            estTotal({ width: 124 }),
            fee({ width: 124 }),
            status({ width: 124 }),
            reduceOnly({ width: 124 }),
            hidden({ width: 124 }),
            orderTime({ width: 124 }),
          ];
        case TabType.cancelled:
          return [
            instrument({ showType: true, width: 124 }),
            side({ width: 124 }),
            fillAndQuantity({
              width: 124,
              disableEdit: true,
              className: "oui-pl-0 oui-pr-0",
            }),
            price({ width: 124, disableEdit: true }),
            avgOpen({ width: 124 }),
            triggerPrice({ width: 124, disableEdit: true }),
            estTotal({ width: 124 }),
            fee({ width: 124 }),
            status({ width: 124 }),
            reduceOnly({ width: 124 }),
            hidden({ width: 124 }),
          ];
        case TabType.rejected:
          return [
            instrument({ showType: true, width: 124 }),
            side({ width: 124 }),
            fillAndQuantity({
              width: 124,
              disableEdit: true,
              className: "oui-pl-0 oui-pr-0",
            }),
            price({ width: 124, disableEdit: true }),
            avgOpen({ width: 124 }),
            triggerPrice({ width: 124, disableEdit: true }),
            estTotal({ width: 124 }),
            fee({ width: 124 }),
            status({ width: 124 }),
            reduceOnly({ width: 124 }),
            hidden({ width: 124 }),
            orderTime({ width: 124 }),
          ];
        case TabType.orderHistory:
          return [
            instrument({ showType: true, width: 124 }),
            side({ width: 124 }),
            fillAndQuantity({
              width: 124,
              disableEdit: true,
              className: "oui-pl-0 oui-pr-0",
            }),
            price({ width: 124, disableEdit: true }),
            avgOpen({ width: 124 }),
            triggerPrice({ width: 124, disableEdit: true }),
            estTotal({ width: 124 }),
            fee({ width: 124 }),
            status({ width: 124 }),
            reduceOnly({ width: 124 }),
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
              {parseBadgesFor(record)?.map((e, index) => (
                <Badge
                  key={index}
                  color={
                    e.toLocaleLowerCase() === "position"
                      ? showGray
                        ? "neutral"
                        : "primary"
                      : "neutral"
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
    dataIndex: "side",
    width: option?.width,
    className: "oui-h-[48px]",
    onSort: option?.enableSort
      ? (r1, r2, sortOrder) => {
          if (sortOrder === "asc") {
            return r2.side.localeCompare(r1.side);
          }
          return r1.side.localeCompare(r2.side);
        }
      : undefined,
    render: (value: string, record) => {
      const clsName = grayCell(record)
        ? "oui-text-base-contrast-20"
        : value === OrderSide.BUY
        ? "oui-text-trade-profit"
        : "oui-text-trade-loss";
      return (
        <span className={cn("oui-font-semibold", clsName)}>
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
    dataIndex: "type",
    width: option?.width,
    className: option?.className,
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
    dataIndex: "fill_quantity",
    className: option?.className,
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
      if (record.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
        return "Entire position";
      }
      return <OrderQuantity order={record} />;
      // return value;
    },
  };
}

function price(option?: {
  title?: string;
  enableSort?: boolean;
  width?: number;
  className?: string;
  disableEdit?: boolean;
}): Column<API.Order> {
  return {
    title: option?.title ?? "Price",
    dataIndex: "price",
    className: option?.className,
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => {
      return <Price order={record} disableEdit={option?.disableEdit} />;
    },
  };
}

function avgPrice(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  disableEdit?: boolean;
}): Column<API.Order> {
  return {
    title: "Avg. price",
    dataIndex: "average_executed_price",
    className: option?.className,
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => {
      return <Text>{commifyOptional(value)}</Text>;
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

function tpslTriggerPrice(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  title?: string;
}): Column<API.Order> {
  return {
    title: option?.title ?? "Trigger",
    className: option?.className,
    dataIndex: "tpsl_trigger_price",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => <OrderTriggerPrice />,
  };
}

function barcketOrderPrice(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}) {
  return {
    title: "TP/SL",
    className: option?.className,
    dataIndex: "barcketOrderPrice",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => (
      <BarcketOrderPrice order={record} />
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
    dataIndex: "executed",
    width: option?.width,
    className: option?.className,
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

function reduceOnly(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Reduce only",
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
        {capitalizeFirstLetter(
          (record?.algo_status || record.status)?.toLocaleLowerCase()
        )}
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
    fixed: "right",
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

function tpslAction(option?: {
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "",
    dataIndex: "",
    width: option?.width,
    className: option?.className,
    align: "right",
    fixed: "right",
    render: (_: string, record: any) => {
      return (
        <Flex gap={3}>
          <TP_SLEditButton order={record} />
          <CancelButton order={record} />
        </Flex>
      );
    },
  };
}
