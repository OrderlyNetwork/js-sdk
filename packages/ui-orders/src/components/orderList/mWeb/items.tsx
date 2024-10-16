import { Badge, cn, Flex, Statistic, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OrderCellState } from "./orderCell.script";
import { FC, useCallback, useMemo } from "react";
import { parseBadgesFor, upperCaseFirstLetter } from "../../../utils/util";
import {
  AlgoOrderRootType,
  API,
  OrderStatus,
  OrderType,
} from "@orderly.network/types";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";

export const Symbol: FC<OrderCellState> = (props) => {
  const { item } = props;
  const isBuy = item.quantity > 0;
  return (
    <Text.formatted
      intensity={80}
      rule="symbol"
      formatString="base-type"
      size="sm"
      // @ts-ignore
      prefix={
        <Badge color={isBuy ? "success" : "danger"} size="xs">
          {isBuy ? "Buy" : "Sell"}
        </Badge>
      }
      // showIcon
    >
      {item.symbol}
    </Text.formatted>
  );
};

export const OrderTypeView: FC<OrderCellState> = (props) => {
  const { item } = props;
  const orderType = useCallback(() => {
    const type =
      typeof item.type === "string"
        ? item.type.replace("_ORDER", "").toLowerCase()
        : item.type;
    const isAlgoOrder =
      item.algo_order_id && item.algo_type !== AlgoOrderRootType.BRACKET;
    if (isAlgoOrder) {
      return `Stop ${type}`;
    }
    return upperCaseFirstLetter(item.type);
  }, [item]);
  return (
    <Flex direction={"row"} gap={1}>
      {parseBadgesFor(props.item)?.map((e, index) => (
        <Badge
          key={index}
          color={e.toLocaleLowerCase() === "position" ? "primary" : "neutral"}
          size="xs"
        >
          {e}
        </Badge>
      ))}
    </Flex>
  );
};

export const OrderTime: FC<OrderCellState> = (props) => {
  const { item } = props;

  return (
    <Text.formatted
      rule={"date"}
      formatString="yyyy-MM-dd hh:mm:ss"
      intensity={36}
      size="2xs"
    >
      {item.updated_time}
    </Text.formatted>
  );
};

export const Qty: FC<OrderCellState> = (props) => {
  const { item } = props;

  const isEntirePosition =
    item.type === OrderType.CLOSE_POSITION &&
    // @ts-ignore
    item?.status !== OrderStatus.FILLED;

  return (
    <Statistic
      label={"Qty."}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.base_dp}
        padding={false}
        coloring
        placeholder="Entire position"
        intensity={80}
      >
        {isEntirePosition ? "--" : item.quantity}
      </Text.numeral>
    </Statistic>
  );
};

export const Filled: FC<OrderCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={<Text>Filled</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        intensity={80}
        padding={false}
        rm={Decimal.ROUND_DOWN}
      >
        {/* {item.algo_order_id
          ? item.total_executed_quantity
          : (item as unknown as API.OrderExt).executed} */}
        {item.total_executed_quantity}
      </Text.numeral>
    </Statistic>
  );
};

export const Notional: FC<OrderCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      align="end"
      label={<Text>Notional{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        coloring
        intensity={80}
        padding={false}
        rm={Decimal.ROUND_DOWN}
      >
        {(item as any).notional ?? "--"}
      </Text.numeral>
    </Statistic>
  );
};

export const EstTotal: FC<OrderCellState> = (props) => {
  const { item } = props;
  const value = useMemo(() => {
    if (item.price && item.quantity) {
      return new Decimal(item.price)
        .mul(item.quantity)
        .toFixed(props.quote_dp, Decimal.ROUND_DOWN);
    }
    return "--";
  }, [item.price, item.quantity]);

  return (
    <Statistic
      align="end"
      label={<Text>ESt. Total{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        coloring
        intensity={80}
        padding={false}
        rm={Decimal.ROUND_DOWN}
      >
        {value}
      </Text.numeral>
    </Statistic>
  );
};

export const TriggerPrice: FC<
  OrderCellState & {
    align?: "start" | "end";
  }
> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Trigger price"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align={props.align}
    >
      <Text.numeral
        dp={props.quote_dp}
        intensity={80}
        padding={false}
        rm={Decimal.ROUND_DOWN}
      >
        {item.trigger_price ?? "--"}
      </Text.numeral>
    </Statistic>
  );
};

export const MarkPrice: FC<OrderCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Mark price"}
      align="end"
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {item.mark_price}
      </Text.numeral>
    </Statistic>
  );
};

export const LimitPrice: FC<OrderCellState> = (props) => {
  const { item } = props;
  const isAlgoOrder = item?.algo_order_id !== undefined;
  const isStopMarket = item?.type === "MARKET" && isAlgoOrder;
  return (
    <Statistic
      label={"Limit price"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {isStopMarket ? (
        <Text>Market</Text>
      ) : (
        <Text.numeral
          dp={props.quote_dp}
          rm={Decimal.ROUND_DOWN}
          intensity={80}
          padding={false}
        >
          {item.price ?? "--"}
        </Text.numeral>
      )}
    </Statistic>
  );
};

export const TPTrigger: FC<OrderCellState> = (props) => {
  const { tp_trigger_price } = useTPSLOrderRowContext();

  return (
    <Statistic
      label={"TP trigger"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
        className="oui-border-b oui-border-dashed oui-border-base-contrast-36"
      >
        {tp_trigger_price ?? "--"}
      </Text.numeral>
    </Statistic>
  );
};

export const SLTrigger: FC<OrderCellState> = (props) => {
  const { sl_trigger_price } = useTPSLOrderRowContext();

  return (
    <Statistic
      label={"TP trigger"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {sl_trigger_price ?? "--"}
      </Text.numeral>
    </Statistic>
  );
};

export const TPPrice: FC<OrderCellState> = (props) => {
  const { tp_trigger_price } = useTPSLOrderRowContext();

  return (
    <Statistic
      label={"TP price"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {tp_trigger_price ?? "MARKET"}
      </Text.numeral>
    </Statistic>
  );
};
export const SLPrice: FC<OrderCellState> = (props) => {
  const { sl_trigger_price } = useTPSLOrderRowContext();

  return (
    <Statistic
      label={"TP price"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {sl_trigger_price ?? "MARKET"}
      </Text.numeral>
    </Statistic>
  );
};

export const TPSLQuantity: FC<OrderCellState> = (props) => {
  const { item } = props;

  const quantity = useMemo(() => {
    if (item.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
      return "Entire position";
    }

    return item.quantity;
  }, [item]);

  return (
    <Statistic
      label={"Quantity"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {quantity}
      </Text.numeral>
    </Statistic>
  );
};

export const AvgPrice: FC<OrderCellState> = (props) => {
  return (
    <Statistic
      label={<Text>Avg price{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {/* @ts-ignore */}
        {props.item?.average_executed_price ?? "--"}
      </Text.numeral>
    </Statistic>
  );
};

export const OrderPrice: FC<OrderCellState> = (props) => {
  return (
    <Statistic
      label={<Text>Order price{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
        placeholder="Market"
      >
        {/* @ts-ignore */}
        {props.item?.price ?? "--"}
      </Text.numeral>
    </Statistic>
  );
};

export const RealizedPnL: FC<OrderCellState> = (props) => {
  return (
    <Statistic
      label={<Text>Real. PnL{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align="end"
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
        coloring
      >
        {/* @ts-ignore */}
        {props.item?.realized_pnl ?? "--"}
      </Text.numeral>
    </Statistic>
  );
};
