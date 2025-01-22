import {
  Badge,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  registerSimpleDialog,
  Text,
  textVariants,
} from "@orderly.network/ui";
import { OrderSide, OrderType } from "@orderly.network/types";
import { OrderlyOrder } from "@orderly.network/types";
import { useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { BBOType2Label, getBBOType, isBBOOrder } from "../../utils";

type Props = {
  order: OrderlyOrder;
  quoteDP: number;
  baseDP: number;

  onConfirm: () => void;
  onCancel: () => void;
};

export const OrderConfirmDialog = (props: Props) => {
  const { baseDP, quoteDP, order, onConfirm, onCancel } = props;

  const { side, order_type, order_type_ext, level } = order;

  const [_, setNeedConfirm] = useLocalStorage("orderly_order_confirm", true);

  const renderPrice = () => {
    if (
      order_type === OrderType.MARKET ||
      order_type === OrderType.STOP_MARKET
    ) {
      return <Text intensity={80}>Market</Text>;
    }

    if (isBBOOrder({ order_type, order_type_ext })) {
      const bboType = getBBOType({
        type: order_type_ext!,
        side,
        level,
      });
      return <Text intensity={80}>{BBOType2Label[bboType!]}</Text>;
    }

    return (
      <Text.numeral
        unit={"USDC"}
        rule={"price"}
        className={"oui-text-base-contrast"}
        unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
        dp={quoteDP}
        padding={false}
      >
        {order.order_price}
      </Text.numeral>
    );
  };

  return (
    <>
      <Flex justify={"between"}>
        <Text.formatted rule={"symbol"} showIcon>
          {order.symbol}
        </Text.formatted>
        <Flex justify={"end"} gapX={1}>
          <OrderTypeTag type={order_type} />
          {side === OrderSide.BUY ? (
            <Badge color={"buy"} size={"sm"}>
              Buy
            </Badge>
          ) : (
            <Badge color={"sell"} size={"sm"}>
              Sell
            </Badge>
          )}
        </Flex>
      </Flex>
      <Divider className="oui-my-4" />
      <div
        className={textVariants({
          size: "sm",
          intensity: 54,
          className: "oui-space-y-1",
        })}
      >
        <Flex justify={"between"}>
          <Text>Qty.</Text>
          <Text.numeral
            rule={"price"}
            dp={baseDP}
            padding={false}
            className="oui-text-base-contrast"
          >
            {order.order_quantity}
          </Text.numeral>
        </Flex>
        {!order.trigger_price ? null : (
          <Flex justify={"between"}>
            <Text>Trigger</Text>
            <Text.numeral
              unit={"USDC"}
              rule={"price"}
              className={"oui-text-base-contrast"}
              unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
              dp={quoteDP}
              padding={false}
            >
              {order.trigger_price}
            </Text.numeral>
          </Flex>
        )}
        <Flex justify={"between"}>
          <Text>Price</Text>
          {renderPrice()}
        </Flex>
        <Flex justify={"between"}>
          <Text>Notional</Text>
          <Text.numeral
            unit={"USDC"}
            rule={"price"}
            dp={quoteDP}
            padding={false}
            className={"oui-text-base-contrast"}
            unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
          >
            {order.total}
          </Text.numeral>
        </Flex>
      </div>
      {order.tp_trigger_price || order.sl_trigger_price ? (
        <>
          <Divider className="oui-my-4" />
          <div
            className={textVariants({
              size: "sm",
              intensity: 54,
              className: "oui-space-y-1",
            })}
          >
            {order.tp_trigger_price && (
              <Flex justify={"between"}>
                <Text>TP Price (Mark)</Text>
                <Text.numeral
                  unit={"USDC"}
                  rule={"price"}
                  coloring
                  dp={quoteDP}
                  padding={false}
                  unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
                >
                  {order.tp_trigger_price}
                </Text.numeral>
              </Flex>
            )}
            {order.sl_trigger_price && (
              <Flex justify={"between"}>
                <Text>SL Price (Mark)</Text>
                <Text.numeral
                  unit={"USDC"}
                  rule={"price"}
                  coloring
                  className="oui-text-trade-loss"
                  unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
                  dp={quoteDP}
                  padding={false}
                >
                  {order.sl_trigger_price}
                </Text.numeral>
              </Flex>
            )}
          </div>
        </>
      ) : null}

      <Flex gapX={1} pt={8} pb={3}>
        <Checkbox
          id="orderConfirm"
          color={"white"}
          onCheckedChange={(checked) => {
            setNeedConfirm(!!!checked);
          }}
        />
        <label
          htmlFor="orderConfirm"
          className={textVariants({
            size: "xs",
            intensity: 54,
          })}
        >
          Disable order confirmation
        </label>
      </Flex>
      <Grid cols={2} gapX={3}>
        <Button color={"secondary"} size={"md"} onClick={() => onCancel()}>
          Cancel
        </Button>
        <Button size={"md"} onClick={() => onConfirm()}>
          Confirm
        </Button>
      </Grid>
    </>
  );
};

OrderConfirmDialog.displayName = "OrderConfirmDialog";

const OrderTypeTag = (props: { type: OrderType }) => {
  const typeStr = useMemo(() => {
    switch (props.type) {
      case OrderType.LIMIT:
        return "Limit";
      case OrderType.MARKET:
        return "Market";
      case OrderType.STOP_LIMIT:
        return "Stop Limit";
      case OrderType.STOP_MARKET:
        return "Stop Market";
      default:
        return "";
    }
  }, [props.type]);

  return (
    <Badge color={"neutral"} size={"sm"}>
      {typeStr}
    </Badge>
  );
};

const Dialog = (
  props: Omit<Props, "onCancel" | "onConfirm"> & {
    close: () => void;
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  }
) => {
  const { close, resolve, reject, ...rest } = props;

  return (
    <OrderConfirmDialog
      {...rest}
      onCancel={close}
      onConfirm={() => {
        resolve();
        close();
      }}
    />
  );
};

export const orderConfirmDialogId = "orderConfirm";

registerSimpleDialog(orderConfirmDialogId, Dialog, {
  size: "sm",
  title: "Order confirm",
});
