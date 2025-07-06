import { useRef, useState } from "react";
import { useLocalStorage, utils } from "@orderly.network/hooks";
import { OrderValidationResult } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { API, OrderSide } from "@orderly.network/types";
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
} from "@orderly.network/ui";
import { transSymbolformString } from "@orderly.network/utils";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import type { PNL_Values } from "./pnlInput/useBuilder.script";
import { TPSLBuilderState } from "./useTPSL.script";

export type TPSLProps = {
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
    isPosition,
  } = props;
  const { t } = useTranslation();

  const { parseErrorMsg } = useOrderEntryFormErrorMsg(errors);

  return (
    <div id="orderly-tp_sl-order-edit-content">
      {(!props.isEditing || (props.isEditing && !props.isPosition)) && (
        <>
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
          <Divider my={4} intensity={8} />
        </>
      )}

      <TPSLPrice
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
      />
      <Grid cols={2} gap={3} mt={4}>
        <Button
          size={"md"}
          color={"secondary"}
          data-testid={"tpsl-cancel"}
          onClick={() => {
            onCancel?.();
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
    if (props.baseTick > 0) {
      const quantity = Number(qty);
      // if (quantity) {
      //   props.onQuantityChange?.(Math.min(props.maxQty, quantity));
      // } else {
      props.onQuantityChange?.(utils.formatNumber(qty, props.baseTick) ?? qty);
      // }
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
              initial: "lg",
              lg: "md",
            }}
            align="right"
            value={isPosition ? "" : props.quantity}
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
              if (qty && qty > props.maxQty) {
                const qty = isPosition ? 0 : props.maxQty;
                props.onQuantityChange?.(qty);
                inputRef.current?.blur();
              }
            }}
            onBlur={(e) => formatQuantity(e.target.value)}
            suffix={
              isPosition ? (
                <button
                  className="oui-text-2xs oui-text-base-contrast-54 oui-px-3"
                  onClick={() => {
                    setTPSL();
                  }}
                >
                  {t("tpsl.entirePosition")}
                </button>
              ) : (
                <span className="oui-text-2xs oui-text-base-contrast-54 oui-px-3">
                  {props.quote}
                </span>
              )
            }
          />
        </div>
        {!props.isEditing && (
          <Button
            onClick={() => {
              const qty = isPosition ? 0 : props.maxQty;
              props.onQuantityChange?.(qty);
              if (qty === 0) {
                setTPSL();
              }
            }}
            variant={"outlined"}
            // size={{
            //   lg: "md",
            //   md: "lg",
            // }}
            className={cn(
              "oui-text-2xs oui-w-[68px] oui-h-[40px] xl:oui-h-[32px]",
              isPosition
                ? "oui-border-primary-light oui-text-primary-light hover:oui-bg-primary-light/20"
                : "oui-bg-base-6 oui-border-line-12 oui-text-base-contrast-54 hover:oui-bg-base-5",
            )}
          >
            {t("common.position")}
          </Button>
        )}
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

// ------------ TP/SL Price and PNL input start------------
const TPSLPrice = (props: {
  tp_pnl?: number;
  sl_pnl?: number;
  quote: string;
  quote_dp?: number;
  onPriceChange: TPSLBuilderState["setOrderPrice"];
  onPnLChange: TPSLBuilderState["setPnL"];
  tp_values: PNL_Values;
  sl_values: PNL_Values;
  tp_trigger_price?: number | string;
  sl_trigger_price?: number | string;
  errors: OrderValidationResult | null;
}) => {
  const { t } = useTranslation();

  const { parseErrorMsg } = useOrderEntryFormErrorMsg(props.errors);

  const onPnLChange = (key: string, value: number | string) => {
    // console.log(key, value);
    props.onPnLChange(key, value);
  };

  return (
    <>
      <div>
        <Flex justify={"between"}>
          <Flex gap={1}>
            <Text size={"2xs"} intensity={80}>
              {t("tpsl.takeProfit")}
            </Text>
            <Text size={"2xs"} intensity={36}>
              {`(${(
                t("orderEntry.orderType.marketOrder") as string
              )?.toLowerCase()})`}
            </Text>
          </Flex>
          <Flex>
            <Text size={"2xs"} intensity={36}>
              {`${t("tpsl.estPnl")}:`}
            </Text>
            <Text.numeral
              size={"2xs"}
              coloring
              showIdentifier
              className="oui-ml-1"
            >
              {props.tp_pnl ?? "-"}
            </Text.numeral>
          </Flex>
        </Flex>
        <Grid cols={2} gap={2} pt={2} pb={4}>
          <PriceInput
            type={"TP"}
            value={props.tp_trigger_price}
            error={parseErrorMsg("tp_trigger_price")}
            onValueChange={(value) => {
              props.onPriceChange("tp_trigger_price", value);
            }}
            quote_dp={props.quote_dp ?? 2}
          />
          <PnlInputWidget
            type={"TP"}
            onChange={onPnLChange}
            quote={props.quote}
            quote_dp={props.quote_dp}
            values={props.tp_values}
          />
        </Grid>
      </div>
      <div>
        <Flex justify={"between"}>
          <Flex gap={1}>
            <Text size={"2xs"} intensity={80}>
              {t("tpsl.stopLoss")}
            </Text>
            <Text size={"2xs"} intensity={36}>
              {`(${(
                t("orderEntry.orderType.marketOrder") as string
              )?.toLowerCase()})`}
            </Text>
          </Flex>

          <Flex>
            <Text size={"2xs"} intensity={36}>
              {`${t("tpsl.estPnl")}:`}
            </Text>
            <Text.numeral
              size={"2xs"}
              coloring
              showIdentifier
              className="oui-ml-1"
            >
              {props.sl_pnl ?? "-"}
            </Text.numeral>
          </Flex>
        </Flex>
        <Grid cols={2} gap={2} pt={2} pb={4}>
          <PriceInput
            type={"SL"}
            value={props.sl_trigger_price}
            error={parseErrorMsg("sl_trigger_price")}
            onValueChange={(value) => {
              props.onPriceChange("sl_trigger_price", value);
            }}
            quote_dp={props.quote_dp ?? 2}
          />
          <PnlInputWidget
            type={"SL"}
            onChange={onPnLChange}
            quote={props.quote}
            quote_dp={props.quote_dp}
            values={props.sl_values}
          />
        </Grid>
      </div>
    </>
  );
};
// ------------ TP/SL Price and PNL input end------------
// ------------ TP/SL Price input start------------
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
        prefix: "oui-text-base-contrast-54",
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
  } = props;
  const { t } = useTranslation();

  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true,
  );
  const textClassName = textVariants({
    size: "xs",
    intensity: 54,
  });

  // console.log("PositionTPSLConfirm", qty, maxQty, quoteDP);

  const isPositionTPSL = _isPositionTPSL ?? qty >= maxQty;

  return (
    <>
      {isEditing && (
        <Text
          as="div"
          size="2xs"
          intensity={80}
          className="oui-mb-3"
        >{`You agree to edit your ${transSymbolformString(
          symbol,
        )} order.`}</Text>
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
      <Flex
        direction={"column"}
        itemAlign={"stretch"}
        gapY={1}
        pt={4}
        // pb={5}
        className={cn(textClassName, "oui-pb-4 xl:oui-pb-5")}
      >
        <Flex>
          <Box grow>{t("common.qty")}</Box>

          <div>
            {isPositionTPSL ? (
              <span className="oui-text-base-contrast">
                {t("tpsl.entirePosition")}
              </span>
            ) : (
              <Text.numeral intensity={98} dp={baseDP} padding={false}>
                {qty}
              </Text.numeral>
            )}
          </div>
        </Flex>
        {typeof tpPrice === "number" && tpPrice > 0 ? (
          <Flex>
            <Box grow>{t("tpsl.tpPrice")}</Box>
            <Text.numeral
              as={"div"}
              coloring
              unit={"USDC"}
              size={"sm"}
              dp={quoteDP}
              unitClassName={"oui-text-base-contrast-54 oui-ml-1"}
            >
              {tpPrice}
            </Text.numeral>
          </Flex>
        ) : null}
        {typeof slPrice === "number" && slPrice > 0 ? (
          <Flex>
            <Box grow>{t("tpsl.slPrice")}</Box>
            <Text.numeral
              as={"div"}
              coloring
              unit={"USDC"}
              size={"sm"}
              dp={quoteDP}
              className="oui-text-trade-loss"
              unitClassName={"oui-text-base-contrast-54 oui-ml-1"}
            >
              {slPrice}
            </Text.numeral>
          </Flex>
        ) : null}

        <Flex>
          <Box grow>{t("common.price")}</Box>
          <div className="oui-text-base-contrast">
            {t("common.marketPrice")}
          </div>
        </Flex>
      </Flex>
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

const MaxQtyButton = (props: {
  onClick: () => void;
  children?: React.ReactNode;
}) => {
  return (
    <button
      className={"oui-leading-none"}
      style={{ lineHeight: 0 }}
      onClick={props.onClick}
    >
      <Text color={"primary"} size={"2xs"}>
        {props.children}
      </Text>
    </button>
  );
};
