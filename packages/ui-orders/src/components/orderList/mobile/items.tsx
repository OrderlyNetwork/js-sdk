import {
  FC,
  PropsWithChildren,
  ReactNode,
  useCallback,
  useMemo,
  useState,
} from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  AlgoOrderRootType,
  API,
  OrderStatus,
  OrderType,
} from "@orderly.network/types";
import { OrderSide } from "@orderly.network/types";
import { Badge, Flex, Statistic, Text, Tooltip } from "@orderly.network/ui";
import { SharePnLBottomSheetId } from "@orderly.network/ui-share";
import { Decimal, getTrailingStopPrice } from "@orderly.network/utils";
import {
  getNotional,
  parseBadgesFor,
  upperCaseFirstLetter,
} from "../../../utils/util";
import { ShareButtonWidget } from "../../shareButton";
import { useTPSLOrderRowContext } from "../tpslOrderRowContext";
import { OrderCellState } from "./orderCell.script";

export const SymbolToken: FC<OrderCellState> = (props) => {
  const { item } = props;
  const isBuy = item.side === OrderSide.BUY;
  const { t } = useTranslation();

  return (
    <Text.formatted
      intensity={80}
      rule="symbol"
      formatString="base-type"
      size="sm"
      // @ts-ignore
      prefix={
        <Badge color={isBuy ? "success" : "danger"} size="xs">
          {isBuy ? t("common.buy") : t("common.sell")}
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

export const OrderState: FC<OrderCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();
  // @ts-ignore
  const status = item.status || item.algo_status;

  const statusMap = useMemo(() => {
    return {
      [OrderStatus.NEW]: t("orders.status.pending"),
      [OrderStatus.FILLED]: t("orders.status.filled"),
      [OrderStatus.PARTIAL_FILLED]: t("orders.status.partialFilled"),
      [OrderStatus.CANCELLED]: t("orders.status.canceled"),
      [OrderStatus.REJECTED]: t("orders.status.rejected"),
      [OrderStatus.INCOMPLETE]: t("orders.status.incomplete"),
      [OrderStatus.COMPLETED]: t("orders.status.completed"),
    };
  }, [t]);

  return (
    <Text.formatted intensity={80} size="2xs">
      {statusMap[status as keyof typeof statusMap] ||
        upperCaseFirstLetter(status)}
    </Text.formatted>
  );
};

export const Qty: FC<OrderCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();
  const isEntirePosition =
    item.type === OrderType.CLOSE_POSITION &&
    // @ts-ignore
    item?.status !== OrderStatus.FILLED;

  return (
    <Statistic
      label={t("common.qty")}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.base_dp}
        padding={false}
        coloring
        placeholder={t("tpsl.entirePosition")}
        intensity={80}
      >
        {isEntirePosition ? t("tpsl.entirePosition") : item.quantity}
      </Text.numeral>
    </Statistic>
  );
};

export const Filled: FC<OrderCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  return (
    <Statistic
      label={<Text>{t("orders.status.filled")}</Text>}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      <Text.numeral
        dp={props.base_dp}
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
  const { t } = useTranslation();

  return (
    <Statistic
      align="end"
      label={
        <Text>
          {t("common.notional")}
          <Text intensity={20}>(USDC)</Text>
        </Text>
      }
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
  const { t } = useTranslation();

  const value = useMemo(() => getNotional(item), [item.price, item.quantity]);

  const rendrerContent = () => {
    if (value) {
      return (
        <Text.numeral
          dp={props.quote_dp}
          coloring
          intensity={80}
          padding={false}
          rm={Decimal.ROUND_DOWN}
        >
          {value}
        </Text.numeral>
      );
    }

    return "--";
  };

  return (
    <Statistic
      align="end"
      label={
        <Text>
          {t("common.notional")}
          <Text intensity={20}>(USDC)</Text>
        </Text>
      }
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {rendrerContent()}
    </Statistic>
  );
};

export const TriggerPrice: FC<
  OrderCellState & {
    align?: "start" | "end";
    isPending?: boolean;
  }
> = (props) => {
  const { item, isPending } = props;
  const { t } = useTranslation();

  const isTrailingStop = item?.algo_type === AlgoOrderRootType.TRAILING_STOP;

  const rendrerContent = () => {
    if (isTrailingStop && isPending && item.activated_price) {
      return (
        <Text.numeral
          dp={props.quote_dp}
          intensity={80}
          padding={false}
          rm={Decimal.ROUND_DOWN}
        >
          {item.activated_price}
        </Text.numeral>
      );
    }

    if (item.trigger_price) {
      return (
        <Text.numeral
          dp={props.quote_dp}
          intensity={80}
          padding={false}
          rm={Decimal.ROUND_DOWN}
        >
          {item.trigger_price}
        </Text.numeral>
      );
    }

    return "--";
  };

  return (
    <Statistic
      label={isTrailingStop ? t("common.trigger") : t("common.triggerPrice")}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
      align={props.align}
    >
      {rendrerContent()}
    </Statistic>
  );
};

export const MarkPrice: FC<OrderCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  return (
    <Statistic
      label={t("common.markPrice")}
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
  const { t } = useTranslation();

  const isAlgoOrder = item?.algo_order_id !== undefined;
  const isTrailingStop = item?.algo_type === AlgoOrderRootType.TRAILING_STOP;
  const isStopMarket = item?.type === "MARKET" && isAlgoOrder;

  const rendrerContent = () => {
    if (isTrailingStop) {
      return "--";
    }
    if (isStopMarket) {
      return <Text>{t("common.marketPrice")}</Text>;
    }

    return (
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {item.price ?? "--"}
      </Text.numeral>
    );
  };

  return (
    <Statistic
      label={t("common.limitPrice")}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {rendrerContent()}
    </Statistic>
  );
};

export const TPTrigger: FC<OrderCellState> = (props) => {
  const { tp_trigger_price, tpPnL } = useTPSLOrderRowContext();
  const { t } = useTranslation();

  return (
    <Statistic
      label={t("tpsl.tpTrigger")}
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
              prefix={<Text intensity={54}>{`${t("tpsl.tpPnl")}:`}&nbsp;</Text>}
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
  const { t } = useTranslation();

  return (
    <Statistic
      label={t("tpsl.slTrigger")}
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
              prefix={
                <Text intensity={54}>{`${t("tpsl.slPnl")}:`}&nbsp;&nbsp;</Text>
              }
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
  const { t } = useTranslation();
  const { tp_order_price } = useTPSLOrderRowContext();

  const renderOrderPrice = useMemo(() => {
    if (tp_order_price === undefined) {
      return <Text>--</Text>;
    }
    if (tp_order_price === OrderType.MARKET) {
      return <Text>{t("common.marketPrice")}</Text>;
    }
    return (
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {tp_order_price}
      </Text.numeral>
    );
  }, [tp_order_price]);

  return (
    <Statistic
      label={t("tpsl.tpPrice")}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {renderOrderPrice}
    </Statistic>
  );
};
export const SLPrice: FC<OrderCellState> = (props) => {
  const { t } = useTranslation();
  const { sl_order_price } = useTPSLOrderRowContext();

  const renderOrderPrice = useMemo(() => {
    if (sl_order_price === undefined) {
      return <Text>--</Text>;
    }
    if (sl_order_price === OrderType.MARKET) {
      return <Text>{t("common.marketPrice")}</Text>;
    }
    return (
      <Text.numeral
        dp={props.quote_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {sl_order_price}
      </Text.numeral>
    );
  }, [sl_order_price]);

  return (
    <Statistic
      label={t("tpsl.slPrice")}
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {renderOrderPrice}
    </Statistic>
  );
};

export const TPSLQuantity: FC<OrderCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const quantity = useMemo(() => {
    if (item.algo_type === AlgoOrderRootType.POSITIONAL_TP_SL) {
      return (
        <span className="oui-text-base-contrast-80">
          {t("tpsl.entirePosition")}
        </span>
      );
    }

    return (
      <Text.numeral
        dp={props.base_dp}
        rm={Decimal.ROUND_DOWN}
        intensity={80}
        padding={false}
      >
        {item.quantity}
      </Text.numeral>
    );
  }, [item, t]);

  return (
    <Statistic
      label={t("common.quantity")}
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
  const { t } = useTranslation();
  return (
    <Statistic
      label={
        <Text>
          {t("common.avgPrice")}
          <Text intensity={20}>(USDC)</Text>
        </Text>
      }
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
  const { t } = useTranslation();
  return (
    <Statistic
      label={
        <Text>
          {t("common.orderPrice")}
          <Text intensity={20}>(USDC)</Text>
        </Text>
      }
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
        placeholder={t("common.marketPrice")}
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
  const { t } = useTranslation();

  return (
    <Statistic
      label={
        <Text>
          {t("common.realizedPnl")}
          <Text intensity={20}>(USDC)</Text>
        </Text>
      }
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
      arrow={{ className: classNames?.arrow }}
    >
      <div onClick={() => setOpen((e) => !e)}>{props.children}</div>
    </Tooltip>
  );
};

export const Fee: FC<OrderCellState> = (props) => {
  const { t } = useTranslation();
  return (
    <Flex justify="end" gapX={1} mt={1}>
      <Text size="2xs" intensity={36}>
        {t("common.fee")}:
      </Text>
      <Text size="2xs" intensity={80}>
        {props.item?.total_fee ?? "--"}
      </Text>
    </Flex>
  );
};

export const TrailingCallback: FC<OrderCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const { callback_value, callback_rate } = item;

  return (
    <Statistic
      label={t("orderEntry.trailing")}
      align="end"
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {callback_rate ? (
        <Text intensity={80}>{`${callback_rate * 100}%`}</Text>
      ) : (
        <Text.numeral
          dp={props.quote_dp}
          rm={Decimal.ROUND_DOWN}
          intensity={80}
          padding={false}
        >
          {callback_value ?? "--"}
        </Text.numeral>
      )}
    </Statistic>
  );
};

export const TrailingPrice: FC<OrderCellState> = (props) => {
  const { item } = props;
  const { t } = useTranslation();

  const value = useMemo(() => {
    return getTrailingStopPrice(item);
  }, [item]);

  return (
    <Statistic
      label={t("common.price")}
      align="start"
      classNames={{
        root: "oui-text-xs",
        label: "oui-text-2xs",
      }}
    >
      {value ? (
        <Text.numeral
          dp={props.quote_dp}
          rm={Decimal.ROUND_DOWN}
          intensity={80}
          padding={false}
        >
          {value}
        </Text.numeral>
      ) : (
        "--"
      )}
    </Statistic>
  );
};
