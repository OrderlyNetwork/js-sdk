import { Badge, cn, Flex, Statistic, Text, Tooltip } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OrderCellState } from "./orderCell.script";
import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { parseBadgesFor, upperCaseFirstLetter } from "../../../utils/util";
import {
  AlgoOrderRootType,
  API,
  OrderStatus,
  OrderType,
} from "@orderly.network/types";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";
import { OrderSide } from "@orderly.network/types";
import { ShareButtonWidget } from "../../shareButton";
import { SharePnLBottomSheetId } from "@orderly.network/ui-share";

export const SymbolToken: FC<OrderCellState> = (props) => {
  const { item } = props;
  const isBuy = item.side === OrderSide.BUY;
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
      onClick={() => {
        props.onSymbolChange?.({ symbol: item.symbol } as API.Symbol);
      }}
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
          color={
            e.toLocaleLowerCase() === "position" ? "primary" : "neutral"
          }
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

export const OrderState: FC<OrderCellState> = (props) => {
  const { item } = props;

  // @ts-ignore
  const status = item.status || item.algo_status;

  const label = () => {
    if (status === "NEW") {
      return upperCaseFirstLetter("pending");
    }
    return upperCaseFirstLetter(status);
  };

  return (
    <Text.formatted intensity={36} size="2xs">
      {label()}
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
  const { tp_trigger_price, tpPnL } = useTPSLOrderRowContext();

  return (
    <Statistic
      label={"TP trigger"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <MobileTooltip
        content={
          tpPnL && (
            <Text.numeral
              size="2xs"
              showIdentifier
              // @ts-ignore
              prefix={<Text intensity={54}>TP PnL:&nbsp;&nbsp;</Text>}
              suffix={<Text intensity={20}>&nbsp;USDC</Text>}
              coloring
            >
              {tpPnL}
            </Text.numeral>
          )
        }
        classNames={{
          content: "oui-bg-base-6 oui-ml-2",
          arrow: "oui-fill-base-6",
        }}
      >
        <Text.numeral
          dp={props.quote_dp}
          rm={Decimal.ROUND_DOWN}
          color="buy"
          padding={false}
          className={
            tp_trigger_price
              ? "oui-border-b oui-border-dashed oui-border-base-contrast-12"
              : undefined
          }
        >
          {tp_trigger_price ?? "--"}
        </Text.numeral>
      </MobileTooltip>
    </Statistic>
  );
};

export const SLTrigger: FC<OrderCellState> = (props) => {
  const { sl_trigger_price, slPnL } = useTPSLOrderRowContext();

  return (
    <Statistic
      label={"SL trigger"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <MobileTooltip
        content={
          slPnL && (
            <Text.numeral
              size="2xs"
              // @ts-ignore
              prefix={<Text intensity={54}>SL PnL:&nbsp;&nbsp;</Text>}
              suffix={<Text intensity={20}>&nbsp;USDC</Text>}
              coloring
            >
              {slPnL}
            </Text.numeral>
          )
        }
        classNames={{
          content: "oui-bg-base-6 oui-ml-2",
          arrow: "oui-fill-base-6",
        }}
      >
        <Text.numeral
          dp={props.quote_dp}
          rm={Decimal.ROUND_DOWN}
          color="sell"
          padding={false}
          className={
            sl_trigger_price
              ? "oui-border-b oui-border-dashed oui-border-base-contrast-12"
              : undefined
          }
        >
          {sl_trigger_price ?? "--"}
        </Text.numeral>
      </MobileTooltip>
    </Statistic>
  );
};

export const TPPrice: FC<OrderCellState> = (props) => {
  // const { tp_trigger_price } = useTPSLOrderRowContext();

  return (
    <Statistic
      label={"TP price"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text intensity={80}>Market</Text>
    </Statistic>
  );
};
export const SLPrice: FC<OrderCellState> = (props) => {
  return (
    <Statistic
      label={"SL price"}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text intensity={80}>Market</Text>
    </Statistic>
  );
};

export const TPSLQuantity: FC<OrderCellState> = (props) => {
  const { item } = props;

  const quantity = useMemo(() => {
    if (item.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
      return <span className="oui-text-base-contrast-80">Entire position</span>;
    }

    return (
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {item.quantity}
      </Text.numeral>
    );
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
      {quantity}
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
  // @ts-ignore
  const value = props?.item?.realized_pnl;
  return (
    <Statistic
      label={<Text>Real. PnL{<Text intensity={20}>(USDC)</Text>}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align="end"
    >
      <Flex gap={1}>
        <Text.numeral
          dp={props.quote_dp}
          rm={Decimal.ROUND_DOWN}
          padding={false}
          intensity={(value ?? 0) == 0 ? 80 : undefined}
          showIdentifier={(value ?? 0) > 0}
        coloring={(value ?? 0) != 0}
      >
        {value ?? "--"}
        </Text.numeral>
        <ShareButtonWidget
          order={props.item}
          sharePnLConfig={props.sharePnLConfig}
          modalId={SharePnLBottomSheetId}
          iconSize={12}
        />
      </Flex>
    </Statistic>
  );
};

export const MobileTooltip: FC<
  PropsWithChildren<{
    content?: string | ReactNode;
    classNames?: {
      content?: string;
      arrow?: string;
    };
  }>
> = (props) => {
  const { classNames, content } = props;
  const [open, setOpen] = useState(false);
  if (typeof content === "undefined") return props.children;
  return (
    <Tooltip
      // @ts-ignore
      content={content}
      className={classNames?.content}
      open={open}
      onOpenChange={setOpen}
      tooltipProps={{
        arrow: {
          className: classNames?.arrow,
        },
      }}
    >
      <div onClick={() => setOpen((e) => !e)}>{props.children}</div>
    </Tooltip>
  );
};
