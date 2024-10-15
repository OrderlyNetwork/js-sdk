import { Badge, cn, Statistic, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OrderCellState } from "./orderCell.script";
import { FC, useCallback, useMemo } from "react";
import { upperCaseFirstLetter } from "../../../utils/util";
import { AlgoOrderRootType, API } from "@orderly.network/types";

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

export const OrderType: FC<OrderCellState> = (props) => {
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
    <Badge color="neutral" size="xs">
      {orderType()}
    </Badge>
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

  return (
    <Statistic
      label={"Qty."}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral dp={props.base_dp} padding={false} coloring>
        {item.quantity}
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
        {item.algo_order_id
          ? item.total_executed_quantity
          : (item as unknown as API.OrderExt).executed}
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

export const TriggerPrice: FC<OrderCellState> = (props) => {
  const { item } = props;

  return (
    <Statistic
      label={"Trigger price"}
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
