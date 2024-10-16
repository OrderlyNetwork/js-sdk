import {
  Badge,
  cn,
  Flex,
  Statistic,
  Text,
  textVariants,
  Tooltip,
} from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OrderCellState } from "./orderCell.script";
import { FC, PropsWithChildren, useCallback, useMemo, useState } from "react";
import { parseBadgesFor, upperCaseFirstLetter } from "../../../utils/util";
import { AlgoOrderRootType, API } from "@orderly.network/types";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";
import { order } from "../../../../../perp/dist";
import { utils } from "@orderly.network/hooks";

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
  
  return (
    <Flex direction={"row"} gap={1}>
      {parseBadgesFor(props.item)?.map((e) => (
        <Badge
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

export const TPTrigger: FC<OrderCellState> = (props) => {
  const { tp_trigger_price, position } = useTPSLOrderRowContext();

  const price = position?.average_open_price;

  let quantity = props.item.quantity;

  if (quantity === 0) {
    if (
      props.item.child_orders[0].type === "CLOSE_POSITION" &&
      typeof position?.position_qty !== "undefined"
    ) {
      quantity = position?.position_qty;
    }
  }

  const pnl =
    tp_trigger_price && typeof price !== "undefined"
      ? utils.priceToPnl(
          {
            qty: quantity,
            price: tp_trigger_price,
            entryPrice: price,
            // @ts-ignore
            orderSide: props.item.side,
            // @ts-ignore
            orderType: props.item.type,
          },
          {
            symbol: { quote_dp: props.quote_dp },
          }
        )
      : undefined;

  console.log("SLTrigger", tp_trigger_price, price, pnl);

  let child = (
    <Text.numeral
      dp={props.quote_dp}
      rm={Decimal.ROUND_DOWN}
      // intensity={80}
      padding={false}
      className={cn(
        typeof pnl !== "undefined"
          ? "oui-border-b oui-border-dashed oui-border-base-contrast-36"
          : undefined,
        "!oui-text-trade-profit oui-ab"
      )}
    >
      {tp_trigger_price ?? "--"}
    </Text.numeral>
  );

  if (typeof pnl !== "undefined") {
    child = (
      <SimpleTooltip
        content={
          <Text.numeral
            prefix={
              <Text intensity={54}>
                TP PnL: {<Text className="oui-text-trade-profit">+</Text>}
              </Text>
            }
            dp={props.quote_dp}
            rm={Decimal.ROUND_DOWN}
            padding={false}
            coloring
          >
            {pnl}
          </Text.numeral>
        }
      >
        {child}
      </SimpleTooltip>
    );
  }

  return (
    <Statistic
      label={"TP trigger"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {child}
    </Statistic>
  );
};

export const SLTrigger: FC<OrderCellState> = (props) => {
  const { sl_trigger_price, position } = useTPSLOrderRowContext();

  const price = position?.average_open_price;

  let quantity = props.item.quantity;

  if (quantity === 0) {
    if (
      props.item.child_orders[0].type === "CLOSE_POSITION" &&
      typeof position?.position_qty !== "undefined"
    ) {
      quantity = position?.position_qty;
    }
  }

  const pnl =
    sl_trigger_price && typeof price !== "undefined"
      ? utils.priceToPnl(
          {
            qty: quantity,
            price: sl_trigger_price,
            entryPrice: price,
            // @ts-ignore
            orderSide: props.item.side,
            // @ts-ignore
            orderType: props.item.type,
          },
          {
            symbol: { quote_dp: props.quote_dp },
          }
        )
      : undefined;

  console.log("SLTrigger", sl_trigger_price, price, pnl);

  let child = (
    <Text.numeral
      dp={props.quote_dp}
      rm={Decimal.ROUND_DOWN}
      // intensity={80}
      padding={false}
      className={cn(
        typeof pnl !== "undefined"
          ? "oui-border-b oui-border-dashed oui-border-base-contrast-36"
          : undefined,
        "!oui-text-trade-loss oui-ab"
      )}
    >
      {sl_trigger_price ?? "--"}
    </Text.numeral>
  );

  if (typeof pnl !== "undefined") {
    child = (
      <SimpleTooltip
        content={
          <Text.numeral
            prefix={<Text intensity={54}>{"SL PnL: "}&nbsp;</Text>}
            dp={props.quote_dp}
            rm={Decimal.ROUND_DOWN}
            padding={false}
            coloring
          >
            {pnl}
          </Text.numeral>
        }
      >
        {child}
      </SimpleTooltip>
    );
  }

  return (
    <Statistic
      label={"SL trigger"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {child}
    </Statistic>
  );
};

export const TPPrice: FC<OrderCellState> = (props) => {
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
        placeholder="Market"
      >
        {"MARKET"}
      </Text.numeral>
    </Statistic>
  );
};
export const SLPrice: FC<OrderCellState> = (props) => {
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
        placeholder="Market"
      >
        {"MARKET"}
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
      align="end"
    >
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
        placeholder="Entire position"
      >
        {quantity}
      </Text.numeral>
    </Statistic>
  );
};

const SimpleTooltip: FC<
  PropsWithChildren<{
    content: string | React.ReactNode;
  }>
> = (props) => {
  const [open, setOpen] = useState(false);
  return (
    <Tooltip content={props.content} open={open} onOpenChange={setOpen}>
      <div
        onClick={(e) => {
          e.stopPropagation();
          e.preventDefault();
          setOpen((e) => !e);
        }}
      >
        {props.children}
      </div>
    </Tooltip>
  );
};
