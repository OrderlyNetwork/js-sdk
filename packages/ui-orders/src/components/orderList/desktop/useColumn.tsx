import {
  AlgoOrderRootType,
  AlgoOrderType,
  API,
  OrderSide,
  OrderStatus,
  OrderType,
} from "@orderly.network/types";
import {
  capitalizeFirstLetter,
  cn,
  Column,
  Flex,
  Text,
} from "@orderly.network/ui";
import { commifyOptional, Decimal } from "@orderly.network/utils";
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
import { BracketOrderPrice } from "./bracketOrderPrice";
import { TP_SLEditButton } from "./tpslEdit";
import { TPSLOrderPrice } from "./tpslPrice";
import { useMemo } from "react";
import { useSymbolContext } from "../symbolProvider";

export const useOrderColumn = (props: {
  _type: TabType;
  onSymbolChange?: (symbol: API.Symbol) => void;
  pnlNotionalDecimalPrecision?: number;
}) => {
  const { _type, onSymbolChange, pnlNotionalDecimalPrecision } = props;

  const columns = useMemo(() => {
    switch (_type) {
      case TabType.all:
        return [
          instrument({
            width: 130,
            showType: true,
            onSymbolChange: onSymbolChange,
            enableSort: false,
          }),
          // side({ width: 130 }),
          fillAndQuantity({
            width: 130,
            disableEdit: true,
            className: "oui-pl-0 oui-pr-0",
            enableSort: false,
          }),
          price({
            width: 130,
            title: "Order price",
            disableEdit: true,
            enableSort: false,
          }),
          avgOpen({ width: 130, enableSort: false }),
          tpslTriggerPrice({ width: 130 }),
          realizedPnL({
            width: 124,
            pnlNotionalDecimalPrecision: pnlNotionalDecimalPrecision,
          }),
          estTotal({ width: 130, enableSort: false }),
          fee({ width: 130 }),
          status({ width: 130 }),
          reduceOnly({ width: 130 }),
          hidden({ width: 130 }),
          cancelBtn({ width: 130 }),
        ];
      case TabType.pending:
        return [
          instrument({
            width: 172,
            showType: true,
            onSymbolChange: onSymbolChange,
            enableSort: false,
          }),
          // side({ width: 162 }),
          fillAndQuantity({
            width: 162,
            className: "oui-pr-0",
            enableSort: false,
          }),
          price({ width: 162, className: "oui-pr-0", enableSort: false }),
          triggerPrice({ width: 162, className: "oui-pr-0" }),
          bracketOrderPrice({ width: 130 }),
          estTotal({ width: 162, isPending: true }),
          reduceOnly({ width: 162 }),
          hidden({ width: 162 }),
          orderTime({ width: 162, enableSort: false }),
          pendingTabCancelBtn({ width: 162 }),
        ];
      case TabType.tp_sl:
        return [
          instrument({
            width: 176,
            showType: true,
            onSymbolChange: onSymbolChange,
            enableSort: false,
          }),
          // side({ width: 176 }),
          quantity({ width: 176 }),
          tpslTriggerPrice({ width: 176 }),
          tpslPrice({ width: 176, disableEdit: true }),
          tpslNotional({ width: 176 }),
          reduceOnly({ width: 176 }),
          orderTime({ width: 176, enableSort: false }),
          tpslAction({ width: 176 }),
        ];
      case TabType.filled:
        return [
          instrument({
            showType: true,
            width: 154,
            onSymbolChange: onSymbolChange,
          }),
          // type({ width: 124 }),
          // side({ width: 124 }),
          fillAndQuantity({
            width: 124,
            disableEdit: true,
            className: "oui-pl-0 oui-pr-0",
          }),
          price({
            width: 124,
            title: "Order price",
            disableEdit: true,
          }),
          avgPrice({ width: 124 }),
          triggerPrice({ width: 124, disableEdit: true }),
          realizedPnL({
            width: 124,
            pnlNotionalDecimalPrecision: pnlNotionalDecimalPrecision,
          }),
          estTotal({ width: 124 }),
          fee({ width: 124 }),
          status({ width: 124 }),
          reduceOnly({ width: 124 }),
          hidden({ width: 124 }),
          orderTime({ width: 124 }),
        ];
      case TabType.cancelled:
        return [
          instrument({
            showType: true,
            width: 154,
            onSymbolChange: onSymbolChange,
            enableSort: false,
          }),
          // side({ width: 124 }),
          fillAndQuantity({
            width: 124,
            disableEdit: true,
            className: "oui-pl-0 oui-pr-0",
            enableSort: false,
          }),
          price({ width: 124, disableEdit: true, enableSort: false }),
          avgOpen({ width: 124, enableSort: false }),
          triggerPrice({ width: 124, disableEdit: true }),
          estTotal({ width: 124 }),
          fee({ width: 124 }),
          status({ width: 124 }),
          reduceOnly({ width: 124 }),
          hidden({ width: 124 }),
        ];
      case TabType.rejected:
        return [
          instrument({
            showType: true,
            width: 154,
            onSymbolChange: onSymbolChange,
          }),
          // side({ width: 124 }),
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
          instrument({
            showType: true,
            width: 154,
            onSymbolChange: onSymbolChange,
          }),
          // side({ width: 124 }),
          fillAndQuantity({
            width: 150,
            disableEdit: true,
            className: "oui-pl-6 oui-pr-0",
          }),
          price({ width: 124, disableEdit: true }),
          avgOpen({ width: 124 }),
          triggerPrice({ width: 124, disableEdit: true }),
          realizedPnL({
            width: 124,
            pnlNotionalDecimalPrecision: pnlNotionalDecimalPrecision,
          }),
          estTotal({ width: 124 }),
          fee({ width: 124 }),
          status({ width: 124 }),
          reduceOnly({ width: 124 }),
          hidden({ width: 124 }),
          orderTime({ width: 150 }),
          cancelBtn({ width: 80 }),
        ];
    }
  }, [_type, pnlNotionalDecimalPrecision]);

  return columns as Column[];

  // return columns();
};

function instrument(option?: {
  showType?: boolean;
  enableSort?: boolean;
  width?: number;
  onSymbolChange?: (symbol: API.Symbol) => void;
}): Column<API.Order> {
  return {
    title: "Symbol",
    dataIndex: "symbol",
    fixed: "left",
    // className: "oui-h-[48px]",
    width: option?.width,
    onSort: option?.enableSort
      ? (r1, r2) => {
          return r1.symbol.localeCompare(r2.symbol);
          // if (sortOrder === "asc") {
          //   return r1.symbol.localeCompare(r2.symbol);
          // }
          // return r2.symbol.localeCompare(r1.symbol);
        }
      : undefined,
    render: (value: string, record) => {
      const showGray = grayCell(record);

      return (
        <Flex gap={2}>
          <div
            className={cn(
              "oui-rounded-[1px] oui-w-1 oui-h-7 oui-shrink-0",
              record.side === OrderSide.BUY
                ? "oui-bg-trade-profit"
                : "oui-bg-trade-loss"
            )}
          />
          <Flex direction="column" itemAlign={"start"}>
            <Text.formatted
              // rule={"symbol"}
              size="xs"
              className="oui-cursor-pointer oui-text-xs"
              onClick={(e) => {
                option?.onSymbolChange?.({ symbol: value } as API.Symbol);
                e.stopPropagation();
                e.preventDefault();
              }}
            >
              {`${value.split("_")[1]}-PERP`}
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
    // className: "oui-h-[48px]",
    onSort: option?.enableSort
      ? (r1, r2, sortOrder) => {
          return r2.side.localeCompare(r1.side);
          // if (sortOrder === "asc") {
          //   return r2.side.localeCompare(r1.side);
          // }
          // return r1.side.localeCompare(r2.side);
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
      if (!!record.parent_algo_type) {
        if (record.algo_type === AlgoOrderType.STOP_LOSS) {
          return record.type === OrderType.CLOSE_POSITION
            ? `Position SL`
            : "SL";
        }

        if (record.algo_type === AlgoOrderType.TAKE_PROFIT) {
          return record.type === OrderType.CLOSE_POSITION
            ? `Position TP`
            : "TP";
        }
      }

      if (record.algo_order_id) {
        return `Stop ` + `${record.type}`.toLowerCase();
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
}): Column<API.AlgoOrderExt> {
  return {
    title: "Filled / Quantity",
    dataIndex: "fill_quantity",
    className: option?.className,
    width: option?.width,
    onSort:
      option?.enableSort ?? false
        ? (a, b) => {
            const aQuantity =
              (a.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
                ? 0
                : a.quantity) ?? 0;
            const bQuantity =
              (b.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
                ? 0
                : b.quantity) ?? 0;

            return compareNumbers(aQuantity, bQuantity);

            // if (type == "asc") {
            //   return compareNumbers(aQuantity, bQuantity);
            // }
            // return compareNumbers(bQuantity, aQuantity);
          }
        : undefined,
    render: (value: string, record: any) => {
      if (
        record.type === OrderType.CLOSE_POSITION &&
        record.status !== OrderStatus.FILLED
      ) {
        return "Entire position";
      }
      return <OrderQuantity order={record} disableEdit={option?.disableEdit} />;
      // return value;
    },
  };
}

function quantity(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.AlgoOrderExt> {
  return {
    title: "Quantity",
    className: option?.className,
    dataIndex: "quantity",
    width: option?.width,
    onSort:
      option?.enableSort ?? false
        ? (a, b) => {
            const aQuantity =
              (a.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
                ? 0
                : a.quantity) ?? 0;
            const bQuantity =
              (b.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL
                ? 0
                : b.quantity) ?? 0;
            return compareNumbers(aQuantity, bQuantity);
            // if (type == "asc") {
            //   return compareNumbers(aQuantity, bQuantity);
            // }
            // return compareNumbers(bQuantity, aQuantity);
          }
        : undefined,
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
    onSort:
      option?.enableSort ?? false
        ? (a, b, type) => {
            return compareNumbers(a.price ?? 0, b.price ?? 0);
            // if (type == "asc") {
            //   return compareNumbers(a.price ?? 0, b.price ?? 0);
            // }
            // return compareNumbers(b.price ?? 0, a.price ?? 0);
          }
        : undefined,
    render: (value: string, record: any) => {
      return <Price order={record} disableEdit={option?.disableEdit} />;
    },
  };
}

function tpslPrice(option?: {
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
      return <TPSLOrderPrice />;
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
      // console.log("average_executed_price", record.average_executed_price);

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

function bracketOrderPrice(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}) {
  return {
    title: "TP/SL",
    className: option?.className,
    dataIndex: "bracketOrderPrice",
    width: option?.width,
    onSort: option?.enableSort,
    render: (value: string, record: any) => (
      <BracketOrderPrice order={record} />
    ),
  };
}

function estTotal(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  isPending?: boolean;
}): Column<API.Order> {
  return {
    title: "Notional",
    dataIndex: "executed",
    width: option?.width,
    className: option?.className,
    onSort:
      option?.enableSort ?? false
        ? (a, b, type) => {
            const aTotal =
              a.type === OrderType.CLOSE_POSITION &&
              a.status !== OrderStatus.FILLED
                ? 0
                : a.total_executed_quantity === 0 ||
                  Number.isNaN(a.average_executed_price) ||
                  a.average_executed_price === null
                ? 0
                : a.total_executed_quantity * a.average_executed_price;
            const bTotal =
              b.type === OrderType.CLOSE_POSITION &&
              b.status !== OrderStatus.FILLED
                ? 0
                : b.total_executed_quantity === 0 ||
                  Number.isNaN(b.average_executed_price) ||
                  b.average_executed_price === null
                ? 0
                : b.total_executed_quantity * b.average_executed_price;
            return compareNumbers(aTotal, bTotal);
            // if (type === "asc") {
            //   return compareNumbers(aTotal, bTotal);
            // }
            // return compareNumbers(bTotal, aTotal);
          }
        : undefined,
    render: (value: string, record: any) => {
      if (option?.isPending) {
        const value = () => {
          if (record.price && record.quantity) {
            return new Decimal(record.price)
              .mul(record.quantity)
              .toFixed(2, Decimal.ROUND_DOWN);
          }
          return "--";
        };

        return <Text.numeral rm={Decimal.ROUND_DOWN}>{value()}</Text.numeral>;
      }

      if (
        record.type === OrderType.CLOSE_POSITION &&
        record.status !== OrderStatus.FILLED
      ) {
        return "Entire position";
      }

      return (
        <Text.numeral rm={Decimal.ROUND_DOWN} dp={2}>
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

function realizedPnL(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
  pnlNotionalDecimalPrecision?: number;
}): Column<API.Order> {
  return {
    title: "Real. PnL",
    dataIndex: "realized_pnl",
    width: option?.width,
    className: option?.className,
    render: (_value: number | undefined) => {
      const { quote_dp } = useSymbolContext();
      const dp = option?.pnlNotionalDecimalPrecision ?? quote_dp;
      const value = new Decimal(_value ?? 0)
        .toDecimalPlaces(dp, Decimal.ROUND_DOWN)
        .toNumber();
      return (
        <Text.numeral
          dp={dp}
          rm={Decimal.ROUND_DOWN}
          padding={false}
          intensity={(value ?? 0) == 0 ? 80 : undefined}
          showIdentifier={(value ?? 0) > 0}
          coloring={(value ?? 0) != 0}
        >
          {value ?? "--"}
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
    render: (value?: string) => (
      <Text.numeral className="oui-break-normal oui-whitespace-nowrap oui-font-semibold">
        {value ?? "--"}
      </Text.numeral>
    ),
  };
}

function tpslNotional(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Notional",
    dataIndex: "executed",
    width: option?.width,
    onSort: option?.enableSort,
    className: option?.className,
    render: (value: any, record: any) => {
      if (record.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
        return "Entire position";
      }

      return (
        <Text.numeral className="oui-break-normal oui-whitespace-nowrap oui-font-semibold">
          {record.quantity === 0
            ? "--"
            : `${new Decimal(record.mark_price)
                .mul(record.quantity)
                .todp(2)
                .toNumber()}`}
        </Text.numeral>
      );
    },
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
    render: (value: string, record: any) => {
      const status = value || record.algo_status;

      if (status === "NEW") {
        return upperCaseFirstLetter("pending");
      }
      return upperCaseFirstLetter(status);
    },
  };
}

function avgOpen(option?: {
  enableSort?: boolean;
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "Avg. open",
    dataIndex: "average_executed_price",
    width: option?.width,
    onSort:
      option?.enableSort ?? false
        ? (a, b) => {
            return compareNumbers(
              a.average_executed_price ?? 0,
              b.average_executed_price ?? 0
            );
            // if (type == "asc") {
            //   return compareNumbers(
            //     a.average_executed_price ?? 0,
            //     b.average_executed_price ?? 0
            //   );
            // }
            // return compareNumbers(
            //   b.average_executed_price ?? 0,
            //   a.average_executed_price ?? 0
            // );
          }
        : undefined,
    className: option?.className,
    render: (value: string, record) => {
      if (record.type === OrderType.MARKET && !value) {
        return "--";
      }
      return (
        <Text.numeral className="oui-break-normal oui-whitespace-nowrap oui-font-semibold">
          {value}
        </Text.numeral>
      );
    },
  };
}

function cancelBtn(option?: {
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "",
    type: "action",
    dataIndex: "action",
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

function pendingTabCancelBtn(option?: {
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "",
    type: "action",
    dataIndex: "action",
    width: option?.width,
    className: option?.className,
    align: "right",
    fixed: "right",
    render: (_: string, record: any) => {
      return <CancelButton order={record} />;
    },
  };
}

function tpslAction(option?: {
  width?: number;
  className?: string;
}): Column<API.Order> {
  return {
    title: "",
    dataIndex: "action",
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

function compareNumbers(a: number, b: number): number {
  if (a > b) return 1;
  if (a < b) return -1;
  return 0;
}
