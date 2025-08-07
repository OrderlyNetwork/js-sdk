import { useRef, useState } from "react";
import {
  ComputedAlgoOrder,
  useLocalStorage,
  utils,
} from "@orderly.network/hooks";
import { OrderValidationResult } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import {
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import {
  Badge,
  Box,
  Button,
  Divider,
  Flex,
  Grid,
  Input,
  Slider,
  Text,
  textVariants,
  cn,
  inputFormatter,
  Checkbox,
  convertValueToPercentage,
  ThrottledButton,
  ScrollArea,
  useScreen,
} from "@orderly.network/ui";
import { transSymbolformString } from "@orderly.network/utils";
import { OrderInfo } from "./components/orderInfo";
import { PnlInfo } from "./components/pnlInfo";
import { TPSLInputRowWidget } from "./components/tpslInputRow";
import { TPSLPositionTypeWidget } from "./components/tpslPostionType";
import { TPSLBuilderState } from "./useTPSL.script";

export type TPSLProps = {
  close?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
};

//------------- TPSL form start ---------------
export const TPSL = (props: TPSLBuilderState & TPSLProps) => {
  const {
    TPSL_OrderEntity,
    symbolInfo,
    onCancel,
    onComplete,
    status,
    errors,
    valid,
    isPosition,
    position,
    setValues,
    onClose,
    isEditing,
  } = props;

  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const { parseErrorMsg } = useOrderEntryFormErrorMsg(errors);

  const renderQtyInput = () => {
    if (TPSL_OrderEntity.position_type === PositionType.FULL) {
      return null;
    }

    return (
      <Box className="oui-px-0.5">
        <TPSLQuantity
          maxQty={props.maxQty}
          quantity={(props.orderQuantity ?? props.maxQty) as number}
          baseTick={symbolInfo("base_tick")}
          dp={symbolInfo("base_dp")}
          onQuantityChange={props.setQuantity}
          quote={symbolInfo("base")}
          isEditing={props.isEditing}
          isPosition={isPosition}
          errorMsg={parseErrorMsg("quantity")}
        />
      </Box>
    );
  };

  return (
    <div id="orderly-tp_sl-order-edit-content">
      <ScrollArea className={cn(isMobile && "oui-h-[calc(100vh-200px)]")}>
        <OrderInfo
          baseDP={symbolInfo("base_dp")}
          quoteDP={symbolInfo("quote_dp")}
          classNames={{
            root: "oui-mb-3",
            container: "oui-gap-x-[30px]",
          }}
          order={{
            symbol: position.symbol,
            order_quantity: position.position_qty.toString(),
            order_price: position.average_open_price.toString(),
          }}
        />
        <Flex
          direction="column"
          justify="start"
          itemAlign={"start"}
          gap={3}
          className="oui-w-full oui-mb-3"
        >
          {!isEditing && (
            <TPSLPositionTypeWidget
              disableSelector
              value={TPSL_OrderEntity.position_type ?? PositionType.PARTIAL}
              onChange={(key, value) => {
                if (value === PositionType.FULL) {
                  setValues({
                    position_type: value,
                    quantity: Math.abs(position.position_qty).toString(),
                    tp_order_price: "",
                    tp_order_type: OrderType.MARKET,
                    tp_trigger_price: "",
                    sl_order_price: "",
                    sl_order_type: OrderType.MARKET,
                    sl_trigger_price: "",
                  });
                } else {
                  setValues({
                    position_type: value,
                    quantity: "",
                    tp_order_price: "",
                    tp_order_type: OrderType.MARKET,
                    tp_trigger_price: "",
                    sl_order_price: "",
                    sl_order_type: OrderType.MARKET,
                    sl_trigger_price: "",
                  });
                }
              }}
            />
          )}
          {TPSL_OrderEntity.position_type === PositionType.FULL && (
            <Text className="oui-text-warning oui-text-2xs">
              {t("tpsl.positionType.full.tips.market")}
            </Text>
          )}
        </Flex>
        {renderQtyInput()}
        <Flex
          direction="column"
          itemAlign={"start"}
          justify={"start"}
          gap={6}
          className="oui-w-full oui-mt-3"
        >
          <TPSLInputRowWidget
            symbol={position.symbol}
            rootOrderPrice={position.average_open_price.toString()}
            type="tp"
            values={{
              enable: TPSL_OrderEntity.tp_enable ?? true,
              trigger_price:
                TPSL_OrderEntity.tp_trigger_price?.toString() ?? undefined,
              PnL: TPSL_OrderEntity.tp_pnl?.toString() ?? undefined,
              Offset: TPSL_OrderEntity.tp_offset?.toString() ?? undefined,
              "Offset%":
                TPSL_OrderEntity.tp_offset_percentage?.toString() ?? undefined,
              order_price:
                TPSL_OrderEntity.tp_order_price?.toString() ?? undefined,
              order_type: TPSL_OrderEntity.tp_order_type ?? OrderType.MARKET,
            }}
            hideOrderPrice={
              TPSL_OrderEntity.position_type === PositionType.FULL
            }
            errors={errors}
            disableOrderTypeSelector={isEditing}
            quote_dp={symbolInfo("quote_dp")}
            positionType={
              TPSL_OrderEntity.position_type ?? PositionType.PARTIAL
            }
            onChange={(key, value) => {
              console.log("key", key, "value", value);
              props.setOrderValue(key as keyof OrderlyOrder, value);
            }}
          />

          <TPSLInputRowWidget
            symbol={position.symbol}
            rootOrderPrice={position.average_open_price.toString()}
            type="sl"
            values={{
              enable: TPSL_OrderEntity.sl_enable ?? true,
              trigger_price:
                TPSL_OrderEntity.sl_trigger_price?.toString() ?? undefined,
              PnL: TPSL_OrderEntity.sl_pnl?.toString() ?? undefined,
              Offset: TPSL_OrderEntity.sl_offset?.toString() ?? undefined,
              "Offset%":
                TPSL_OrderEntity.sl_offset_percentage?.toString() ?? undefined,
              order_price:
                TPSL_OrderEntity.sl_order_price?.toString() ?? undefined,
              order_type: TPSL_OrderEntity.sl_order_type ?? OrderType.MARKET,
            }}
            hideOrderPrice={
              TPSL_OrderEntity.position_type === PositionType.FULL
            }
            errors={errors}
            quote_dp={symbolInfo("quote_dp")}
            positionType={
              TPSL_OrderEntity.position_type ?? PositionType.PARTIAL
            }
            disableOrderTypeSelector={isEditing}
            onChange={(key, value) => {
              console.log("key", key, "value", value);
              props.setOrderValue(key as keyof OrderlyOrder, value);
            }}
          />
        </Flex>

        {/* <TPSLPrice
        sl_pnl={TPSL_OrderEntity.sl_pnl}
        tp_pnl={TPSL_OrderEntity.tp_pnl}
        quote={symbolInfo("quote")}
        quote_dp={symbolInfo("quote_dp")}
        onPriceChange={props.setOrderPrice}
        onPnLChange={props.setPnL}
        errors={errors}
        tp_values={{
          PnL: `${TPSL_OrderEntity.tp_pnl ?? ""}`,
          Offset: `${TPSL_OrderEntity.tp_offset ?? ""}`,
          "Offset%": `${TPSL_OrderEntity.tp_offset_percentage ?? ""}`,
        }}
        sl_values={{
          PnL: `${TPSL_OrderEntity.sl_pnl ?? ""}`,
          Offset: `${TPSL_OrderEntity.sl_offset ?? ""}`,
          "Offset%": `${TPSL_OrderEntity.sl_offset_percentage ?? ""}`,
        }}
        tp_trigger_price={TPSL_OrderEntity.tp_trigger_price ?? ""}
        sl_trigger_price={TPSL_OrderEntity.sl_trigger_price ?? ""}
      /> */}
        <PnlInfo
          tp_pnl={TPSL_OrderEntity.tp_pnl}
          sl_pnl={TPSL_OrderEntity.sl_pnl}
          className="oui-my-3"
        />
      </ScrollArea>
      <Grid cols={2} gap={3} mt={4}>
        <Button
          size={"md"}
          color={"secondary"}
          data-testid={"tpsl-cancel"}
          onClick={() => {
            props.close?.();
          }}
        >
          {t("common.cancel")}
        </Button>
        <ThrottledButton
          size={"md"}
          data-testid={"tpsl-confirm"}
          disabled={!props.valid || status.isCreateMutating}
          loading={status.isCreateMutating || status.isUpdateMutating}
          onClick={() => {
            props
              .onSubmit()
              .then(() => {
                props.close?.();
                onComplete?.();
              })
              .catch((err) => {
                console.log("--->>>cancel order", err);
              });
          }}
        >
          {t("common.confirm")}
        </ThrottledButton>
      </Grid>
    </div>
  );
};

//----------

// ------------- Quantity input start------------
const TPSLQuantity = (props: {
  maxQty: number;
  baseTick: number;
  dp: number;
  quote: string;
  onQuantityChange?: (value: number | string) => void;
  quantity: number;
  isEditing?: boolean;
  isPosition?: boolean;
  setOrderValue?: (key: string, value: number | string) => void;
  errorMsg?: string;
}) => {
  // const isPosition = props.quantity === props.maxQty;
  const { isPosition } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQtyPercentage =
    convertValueToPercentage(props.quantity, 0, props.maxQty) / 100;
  const { t } = useTranslation();

  const setTPSL = () => {
    props.onQuantityChange?.(0);
    inputRef.current?.focus();

    setTimeout(() => {
      inputRef.current?.setSelectionRange(0, 1);
    }, 0);
  };

  const formatQuantity = (qty: string) => {
    let _qty = qty;
    if (Number(qty) > props.maxQty) {
      _qty = props.maxQty.toString();
    }
    if (props.baseTick > 0) {
      props.onQuantityChange?.(utils.formatNumber(_qty, props.baseTick) ?? qty);
    }
  };

  const errorMsg =
    (isPosition ? "" : props.quantity).toString().length > 0
      ? props.errorMsg
      : undefined;

  return (
    <>
      <Flex gap={2}>
        <div className={"oui-flex-1"}>
          <Input.tooltip
            data-testid="oui-testid-tpsl-popUp-quantity-input"
            ref={inputRef}
            prefix={t("common.quantity")}
            size={{
              initial: "md",
              lg: "sm",
            }}
            align="right"
            value={props.quantity}
            autoComplete="off"
            classNames={{
              prefix: "oui-text-base-contrast-54",
              root: cn(
                "oui-bg-base-5 oui-outline-line-12",
                errorMsg && "oui-outline-danger",
              ),
            }}
            tooltipProps={{
              content: {
                className: "oui-bg-base-6 oui-text-base-contrast-80",
              },
              arrow: {
                className: "oui-fill-base-6",
              },
            }}
            tooltip={errorMsg}
            color={errorMsg ? "danger" : undefined}
            formatters={[
              inputFormatter.dpFormatter(props.dp),
              inputFormatter.numberFormatter,
              inputFormatter.currencyFormatter,
              inputFormatter.decimalPointFormatter,
            ]}
            onValueChange={(value) => {
              props.onQuantityChange?.(value);
              const qty = Number(value);
              console.log("qty", value, Number(value), qty);
              if (qty && qty > props.maxQty) {
                const qty = isPosition ? 0 : props.maxQty;
                props.onQuantityChange?.(qty);
                inputRef.current?.blur();
              }
            }}
            onBlur={(e) => formatQuantity(e.target.value)}
            suffix={
              <span className="oui-text-2xs oui-text-base-contrast-54 oui-px-3">
                {props.quote}
              </span>
            }
          />
        </div>
      </Flex>
      <Flex mt={2} itemAlign={"center"} height={"15px"}>
        <Slider.single
          markCount={5}
          color="primary"
          max={props.maxQty}
          min={0}
          showTip
          step={props.baseTick}
          value={props.quantity}
          onValueCommit={(value) => {
            formatQuantity(`${value}`);
          }}
          onValueChange={(value) => {
            props.onQuantityChange?.(value);
          }}
        />
      </Flex>
      <Flex justify={"between"}>
        <Text.numeral rule={"percentages"} color={"primary"} size={"2xs"}>
          {currentQtyPercentage}
        </Text.numeral>
        <Flex itemAlign={"center"} gap={1}>
          <button
            className={"oui-leading-none"}
            style={{ lineHeight: 0 }}
            onClick={() => {
              props.onQuantityChange?.(props.maxQty);
            }}
          >
            <Text color={"primary"} size={"2xs"}>
              {t("common.max")}
            </Text>
          </button>

          <Text.numeral
            rule={"price"}
            size={"2xs"}
            intensity={54}
            tick={props.baseTick}
          >
            {props.maxQty}
          </Text.numeral>
        </Flex>
      </Flex>
    </>
  );
};
// ------------- Quantity input end------------

export const PriceInput = (props: {
  type: string;
  label?: string;
  value?: string | number;
  error?: string;
  onValueChange: (value: string) => void;
  quote_dp: number;
  disabled?: boolean;
}) => {
  const [placeholder, setPlaceholder] = useState<string>("USDC");
  const { t } = useTranslation();

  return (
    <Input.tooltip
      data-testid={`oui-testid-tpsl-popUp-${props.type.toLowerCase()}-input`}
      // prefix={`${props.type} price`}
      prefix={props.label ?? t("common.markPrice")}
      size={{
        initial: "lg",
        lg: "md",
      }}
      tooltip={props.error}
      placeholder={placeholder}
      disabled={props.disabled}
      align={"right"}
      autoComplete={"off"}
      value={props.value}
      color={props.error ? "danger" : undefined}
      classNames={{
        input: "oui-text-2xs placeholder:oui-text-2xs",
        prefix: "oui-text-base-contrast-54 oui-text-2xs",
        root: "oui-w-full",
        // root: "oui-outline-line-12 focus-within:oui-outline-primary-light",
      }}
      onValueChange={props.onValueChange}
      onFocus={() => {
        setPlaceholder("");
      }}
      onBlur={() => {
        setPlaceholder("USDC");
      }}
      formatters={[
        inputFormatter.numberFormatter,
        inputFormatter.dpFormatter(props.quote_dp),
        inputFormatter.currencyFormatter,
        inputFormatter.decimalPointFormatter,
      ]}
    />
  );
};

export type PositionTPSLConfirmProps = {
  symbol: string;
  // isPosition: boolean;
  qty: number;
  tpPrice?: number;
  slPrice?: number;
  maxQty: number;
  side: OrderSide;
  // symbolConfig:API.SymbolExt
  baseDP: number;
  quoteDP: number;
  isEditing?: boolean;
  isPositionTPSL?: boolean;
  orderInfo: ComputedAlgoOrder;
};

// ------------ Position TP/SL Confirm dialog start------------
export const PositionTPSLConfirm = (props: PositionTPSLConfirmProps) => {
  const {
    symbol,
    tpPrice,
    slPrice,
    qty,
    maxQty,
    side,
    quoteDP,
    baseDP,
    isEditing,
    isPositionTPSL: _isPositionTPSL,
    orderInfo: order,
  } = props;
  const { t } = useTranslation();

  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true,
  );
  const renderPositionType = () => {
    if (order.position_type === PositionType.FULL) {
      return <Text>{t("tpsl.positionType.full")}</Text>;
    }
    return <Text>{t("tpsl.positionType.partial")}</Text>;
  };
  // console.log("PositionTPSLConfirm", qty, maxQty, quoteDP);

  const renderTPSLPrice = ({
    price,
    isOrderPrice,
    isEnable,
    colorType,
  }: {
    price: string | number;
    isOrderPrice?: boolean;
    isEnable?: boolean;
    colorType: "TP" | "SL";
  }) => {
    if (!isEnable) {
      return <Text className="oui-text-base-contrast-36">-- USDC</Text>;
    }
    if (!price) {
      if (isOrderPrice) {
        return (
          <Text className="oui-text-base-contrast-36">
            {t("common.market")}
          </Text>
        );
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
        dp={quoteDP}
        padding={false}
      >
        {price}
      </Text.numeral>
    );
  };

  const isPositionTPSL = _isPositionTPSL ?? qty >= maxQty;

  return (
    <>
      {isEditing && (
        <Text as="div" size="2xs" intensity={80} className="oui-mb-3">
          {t("tpsl.agreement", { symbol: transSymbolformString(symbol) })}
        </Text>
      )}

      <Flex pb={4}>
        <Box grow>
          <Text.formatted
            rule={"symbol"}
            formatString="base-type"
            size="base"
            showIcon
            as="div"
            intensity={80}
          >
            {symbol}
          </Text.formatted>
        </Box>
        <Flex gap={1}>
          {isPositionTPSL && (
            <Badge size="xs" color={"primary"}>
              {t("common.position")}
            </Badge>
          )}

          {/* <Badge size="xs" color="neutral">
            TP/SL
          </Badge> */}
          <TPSLOrderType tpPrice={tpPrice} slPrice={slPrice} />
          {side === OrderSide.SELL ? (
            <Badge size="xs" color="success">
              {t("common.buy")}
            </Badge>
          ) : (
            <Badge size="xs" color="danger">
              {t("common.sell")}
            </Badge>
          )}
        </Flex>
      </Flex>
      <Divider />
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
            <Text className="oui-text-base-contrast">
              {renderPositionType()}
            </Text>
            <Flex justify={"between"}>
              <Text>{t("common.orderQty")}</Text>
              <Text.numeral
                rule={"price"}
                dp={baseDP}
                padding={false}
                className="oui-text-base-contrast"
              >
                {order.quantity ?? "-"}
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
                <Text>{t("tpsl.tpTriggerPrice")}</Text>{" "}
                {renderTPSLPrice({
                  price: order.tp_trigger_price ?? "",
                  isOrderPrice: false,
                  isEnable: !!order.tp_trigger_price,
                  colorType: "TP",
                })}
              </Flex>
              <Flex justify={"between"} className="oui-w-full">
                <Text>{t("tpsl.tpOrderPrice")}</Text>
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
                <Text>{t("tpsl.slTriggerPrice")}</Text>
                {renderTPSLPrice({
                  price: order.sl_trigger_price ?? "",
                  isOrderPrice: false,
                  isEnable: !!order.sl_trigger_price,
                  colorType: "SL",
                })}
              </Flex>
              <Flex justify={"between"} className="oui-w-full">
                <Text>{t("tpsl.slOrderPrice")}</Text>
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
      <Box pt={2}>
        <Flex gap={1}>
          <Checkbox
            id="disabledConfirm"
            color="white"
            checked={!needConfirm}
            onCheckedChange={(check) => {
              setNeedConfirm(!check);
            }}
          />
          <label
            htmlFor="disabledConfirm"
            className={textVariants({
              size: "xs",
              intensity: 54,
              className: "oui-ml-1",
            })}
          >
            {t("orderEntry.disableOrderConfirm")}
          </label>
        </Flex>
      </Box>
    </>
  );
};

//------------- Position TP/SL Confirm dialog end------------

const TPSLOrderType = (props: { tpPrice?: number; slPrice?: number }) => {
  const { tpPrice, slPrice } = props;
  const { t } = useTranslation();

  if (!!tpPrice && !!slPrice) {
    return (
      <Badge size="xs" color="neutral">
        {t("common.tpsl")}
      </Badge>
    );
  }

  if (!!tpPrice) {
    return (
      <Badge size="xs" color="neutral">
        {t("tpsl.tp")}
      </Badge>
    );
  }

  if (!!slPrice) {
    return (
      <Badge size="xs" color="neutral">
        {t("tpsl.sl")}
      </Badge>
    );
  }

  return null;
};
