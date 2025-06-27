import { useMemo } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { i18n, useTranslation } from "@orderly.network/i18n";
import { BBOOrderType, OrderSide, OrderType } from "@orderly.network/types";
import { OrderlyOrder } from "@orderly.network/types";
import {
  Badge,
  Box,
  Button,
  Checkbox,
  Divider,
  Flex,
  Grid,
  registerSimpleDialog,
  Text,
  textVariants,
} from "@orderly.network/ui";
import { getBBOType, isBBOOrder } from "../../utils";

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
  const { t } = useTranslation();

  const [_, setNeedConfirm] = useLocalStorage("orderly_order_confirm", true);

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
            dp={baseDP}
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
              dp={quoteDP}
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
            {/* TODO i18n*/}
            <Text>TP/SL for {order.position_type}</Text>
            <Flex justify={"between"}>
              <Text>Quantity</Text>
              <Text.numeral
                rule={"price"}
                dp={baseDP}
                padding={false}
                className="oui-text-base-contrast"
              >
                {/* TODO if positionType is full, need show position qty*/}
                {order.order_quantity}
              </Text.numeral>
            </Flex>

            {order.tp_trigger_price && (
              <>
                <Flex justify={"between"}>
                  {/* TODO i18n*/}
                  <Text>TP trigger price</Text>
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

                <Flex justify={"between"}>
                  {/* TODO i18n*/}
                  <Text>TP order price</Text>
                  <Text className="oui-text-base-contrast">Market</Text>
                </Flex>
              </>
            )}
            {order.sl_trigger_price && (
              <>
                <Flex justify={"between"}>
                  {/* TODO i18n*/}
                  <Text>SL trigger price</Text>
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
                <Flex justify={"between"}>
                  {/* TODO i18n*/}
                  <Text>SL order price</Text>
                  <Text className="oui-text-base-contrast">Market</Text>
                </Flex>
              </>
            )}
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

      {order.tp_trigger_price || order.sl_trigger_price ? (
        <Box py={3} px={3} className="oui-text-center">
          <Text color="warning" size="xs">
            {t("orderEntry.tpsl.trigger.description")}
          </Text>
        </Box>
      ) : null}

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
  props: Omit<Props, "onCancel" | "onConfirm"> & {
    close: () => void;
    resolve: (value?: any) => void;
    reject: (reason?: any) => void;
  },
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
  title: () => i18n.t("orderEntry.orderConfirm"),
});
