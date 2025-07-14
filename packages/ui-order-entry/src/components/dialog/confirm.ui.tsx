import { useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { usePositionStream } from "@orderly.network/hooks";
import { i18n, useTranslation } from "@orderly.network/i18n";
import {
  BBOOrderType,
  API,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import { OrderlyOrder } from "@orderly.network/types";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  cn,
  Divider,
  Flex,
  Grid,
  registerSimpleDialog,
  Text,
  textVariants,
} from "@orderly.network/ui";
import { getBBOType, isBBOOrder } from "../../utils";

type OrderConfirmDialogProps = {
  order: OrderlyOrder;
  symbolInfo: API.SymbolExt;
  onConfirm: () => void;
  onCancel: () => void;
};

export const OrderConfirmDialog = (props: OrderConfirmDialogProps) => {
  const { symbolInfo, order, onConfirm, onCancel } = props;
  const { quote_dp, base_dp } = symbolInfo;
  const { side, order_type, order_type_ext, level, symbol } = order;
  const { t } = useTranslation();
  const [{ rows: positions }, positionsInfo] = usePositionStream(symbol);
  const position = positions?.[0];
  const positionQty = position?.position_qty;

  const [_, setNeedConfirm] = useLocalStorage("orderly_order_confirm", true);

  const renderPositionType = () => {
    if (order.position_type === PositionType.FULL) {
      return <Text>Full position</Text>;
    }
    return <Text>Partial position</Text>;
  };

  const renderPrice = () => {
    if (
      order_type === OrderType.MARKET ||
      order_type === OrderType.STOP_MARKET
    ) {
      return <Text intensity={80}>{t("common.marketPrice")}</Text>;
    }

    if (isBBOOrder({ order_type, order_type_ext })) {
      const bboType = getBBOType({
        type: order_type_ext!,
        side,
        level,
      });
      const label = {
        [BBOOrderType.COUNTERPARTY1]: t("orderEntry.bbo.counterparty1"),
        [BBOOrderType.COUNTERPARTY5]: t("orderEntry.bbo.counterparty5"),
        [BBOOrderType.QUEUE1]: t("orderEntry.bbo.queue1"),
        [BBOOrderType.QUEUE5]: t("orderEntry.bbo.queue5"),
      }[bboType!];

      return <Text intensity={80}>{label}</Text>;
    }

    return (
      <Text.numeral
        unit={"USDC"}
        rule={"price"}
        className={"oui-text-base-contrast"}
        unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
        dp={quote_dp}
        padding={false}
      >
        {order.order_price}
      </Text.numeral>
    );
  };

  const renderTPSLPrice = ({
    price,
    isOrderPrice,
    isEnable,
    colorType,
  }: {
    price: string;
    isOrderPrice?: boolean;
    isEnable?: boolean;
    colorType: "TP" | "SL";
  }) => {
    if (!isEnable) {
      return <Text className="oui-text-base-contrast-36">-- USDC</Text>;
    }
    if (!price) {
      if (isOrderPrice) {
        return <Text className="oui-text-base-contrast-36">Market</Text>;
      }
    }
    return (
      <Text.numeral
        unit={"USDC"}
        rule={"price"}
        className={cn(
          "oui-text-base-contrast",
          colorType === "TP" ? "oui-text-trade-profit" : "oui-text-trade-loss",
        )}
        unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
        dp={quote_dp}
        padding={false}
      >
        {price}
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
              {t("common.buy")}
            </Badge>
          ) : (
            <Badge color={"sell"} size={"sm"}>
              {t("common.sell")}
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
          <Text>{t("common.qty")}</Text>
          <Text.numeral
            rule={"price"}
            dp={base_dp}
            padding={false}
            className="oui-text-base-contrast"
          >
            {order.order_quantity}
          </Text.numeral>
        </Flex>
        {!order.trigger_price ? null : (
          <Flex justify={"between"}>
            <Text>{t("common.trigger")}</Text>
            <Text.numeral
              unit={"USDC"}
              rule={"price"}
              className={"oui-text-base-contrast"}
              unitClassName={"oui-text-base-contrast-36 oui-ml-1"}
              dp={quote_dp}
              padding={false}
            >
              {order.trigger_price}
            </Text.numeral>
          </Flex>
        )}
        <Flex justify={"between"}>
          <Text>{t("common.price")}</Text>
          {renderPrice()}
        </Flex>
        <Flex justify={"between"}>
          <Text>{t("common.notional")}</Text>
          <Text.numeral
            unit={"USDC"}
            rule={"price"}
            dp={quote_dp}
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
              className:
                "oui-space-y-1 oui-w-full oui-flex oui-flex-col oui-gap-3",
            })}
          >
            {/* TODO i18n*/}
            <Text className="oui-text-base-contrast">
              TP/SL for {renderPositionType()}
            </Text>
            <Flex justify={"between"}>
              <Text>Order Qty.</Text>
              <Text.numeral
                rule={"price"}
                dp={base_dp}
                padding={false}
                className="oui-text-base-contrast"
              >
                {/* TODO if positionType is full, need show position qty*/}
                {order.position_type === PositionType.FULL
                  ? positionQty
                  : order.order_quantity}
              </Text.numeral>
            </Flex>

            <Flex
              direction={"column"}
              justify={"between"}
              itemAlign={"start"}
              gap={1}
              className="oui-w-full"
            >
              <Flex justify={"between"} className="oui-w-full">
                {/* TODO i18n*/}
                <Text>TP trigger price</Text>
                {renderTPSLPrice({
                  price: order.tp_trigger_price ?? "",
                  isOrderPrice: false,
                  isEnable: !!order.tp_trigger_price,
                  colorType: "TP",
                })}
              </Flex>
              <Flex justify={"between"} className="oui-w-full">
                {/* TODO i18n*/}
                <Text>TP order price</Text>
                {renderTPSLPrice({
                  price: order.tp_order_price ?? "",
                  isOrderPrice: true,
                  isEnable: !!order.tp_trigger_price,
                  colorType: "TP",
                })}
              </Flex>
            </Flex>

            <Flex
              direction={"column"}
              justify={"between"}
              itemAlign={"start"}
              gap={1}
              className="oui-w-full"
            >
              <Flex justify={"between"} className="oui-w-full">
                {/* TODO i18n*/}
                <Text>SL trigger price</Text>
                {renderTPSLPrice({
                  price: order.sl_trigger_price ?? "",
                  isOrderPrice: false,
                  isEnable: !!order.sl_trigger_price,
                  colorType: "SL",
                })}
              </Flex>
              <Flex justify={"between"} className="oui-w-full">
                {/* TODO i18n*/}
                <Text>SL order price</Text>
                {renderTPSLPrice({
                  price: order.sl_order_price ?? "",
                  isOrderPrice: true,
                  isEnable: !!order.sl_trigger_price,
                  colorType: "SL",
                })}
              </Flex>
            </Flex>
          </div>
        </>
      ) : null}

      <Flex gapX={1} pt={4} pb={5}>
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
          {t("orderEntry.disableOrderConfirm")}
        </label>
      </Flex>

      <Grid cols={2} gapX={3}>
        <Button color={"secondary"} size={"md"} onClick={() => onCancel()}>
          {t("common.cancel")}
        </Button>
        <Button size={"md"} onClick={() => onConfirm()}>
          {t("common.confirm")}
        </Button>
      </Grid>
    </>
  );
};

OrderConfirmDialog.displayName = "OrderConfirmDialog";

const OrderTypeTag = (props: { type: OrderType }) => {
  const { t } = useTranslation();
  const typeStr = useMemo(() => {
    switch (props.type) {
      case OrderType.LIMIT:
        return t("orderEntry.orderType.limit");
      case OrderType.MARKET:
        return t("common.marketPrice");
      case OrderType.STOP_LIMIT:
        return t("orderEntry.orderType.stopLimit");
      case OrderType.STOP_MARKET:
        return t("orderEntry.orderType.stopMarket");
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
  props: Omit<OrderConfirmDialogProps, "onCancel" | "onConfirm"> & {
    close: () => void;
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  },
) => {
  const { close, resolve, reject, ...rest } = props;

  return (
    <OrderConfirmDialog
      {...rest}
      onCancel={() => {
        reject();
        close();
      }}
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
  title: () => i18n.t("orderEntry.orderConfirm"),
});
