import { useRef, useState } from "react";
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
} from "@orderly.network/ui";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { TPSLBuilderState } from "./useTPSL.script";

import type { PNL_Values } from "./pnlInput/useBuilder.script";
import { useLocalStorage } from "@orderly.network/hooks";
import { API, OrderSide } from "@orderly.network/types";
import { transSymbolformString } from "@orderly.network/utils";

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

  // console.log("TPSL", props);

  return (
    <div id="orderly-tp_sl-order-edit-content">
      {(!props.isEditing || (props.isEditing && !props.isPosition)) && (
        <>
          <TPSLQuantity
            maxQty={props.maxQty}
            quantity={(props.orderQuantity ?? props.maxQty) as number}
            tick={symbolInfo("base_tick")}
            dp={symbolInfo("base_dp")}
            onQuantityChange={props.setQuantity}
            quote={symbolInfo("base")}
            isEditing={props.isEditing}
            isPosition={isPosition}
          />
          <Divider my={4} intensity={8} />
        </>
      )}

      <TPSLPrice
        sl_pnl={TPSL_OrderEntity.sl_pnl}
        tp_pnl={TPSL_OrderEntity.tp_pnl}
        quote={symbolInfo("quote")}
        quote_db={symbolInfo("quote_dp")}
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
          Cancel
        </Button>
        <Button
          size={"md"}
          data-testid={"tpsl-confirm"}
          disabled={!props.valid || status.isCreateMutating}
          loading={status.isCreateMutating || status.isUpdateMutating}
          onClick={() => {
            props.onSubmit().then(
              () => {
                onComplete?.();
              },
              () => {
                console.log("--->>>cancel order");
              }
            );
          }}
        >
          Confirm
        </Button>
      </Grid>
    </div>
  );
};

//----------

// ------------- Quantity input start------------
const TPSLQuantity = (props: {
  maxQty: number;
  tick: number;
  dp: number;
  quote: string;
  onQuantityChange?: (value: number | string) => void;
  quantity: number;
  isEditing?: boolean;
  isPosition?: boolean;
  setOrderValue?: (key: string, value: number | string) => void;
}) => {
  // const isPosition = props.quantity === props.maxQty;
  const { isPosition } = props;
  const inputRef = useRef<HTMLInputElement>(null);
  const currentQtyPercentage =
    convertValueToPercentage(props.quantity, 0, props.maxQty) / 100;

  const setTPSL = () => {
    props.onQuantityChange?.(0);
    inputRef.current?.focus();

    setTimeout(() => {
      inputRef.current?.setSelectionRange(0, 1);
    }, 0);
  };

  return (
    <>
      <Flex gap={2}>
        <div className={"oui-flex-1"}>
          <Input
            ref={inputRef}
            prefix={"Quantity"}
            size={{
              initial: "lg",
              lg: "md",
            }}
            align="right"
            value={isPosition ? "" : props.quantity}
            autoComplete="off"
            classNames={{
              prefix: "oui-text-base-contrast-54",
              root: "oui-bg-base-5",
            }}
            formatters={[
              inputFormatter.dpFormatter(props.dp),
              inputFormatter.numberFormatter,
              inputFormatter.currencyFormatter,
            ]}
            onValueChange={(value) => {
              props.onQuantityChange?.(value);
            }}
            suffix={
              isPosition ? (
                <button
                  className="oui-text-2xs oui-text-base-contrast-54 oui-px-3"
                  onClick={() => {
                    setTPSL();
                  }}
                >
                  Entire position
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
            size={{
              lg: "md",
              md: "lg",
            }}
            className={cn(
              isPosition
                ? "oui-border-primary-light oui-text-primary-light hover:oui-bg-primary-light/20"
                : "oui-border-line-12 oui-text-base-contrast-54 hover:oui-bg-base-5"
            )}
          >
            Position
          </Button>
        )}
      </Flex>
      <Flex mt={2} itemAlign={"center"} height={"15px"}>
        <Slider.single
          markCount={5}
          color="primaryLight"
          max={props.maxQty}
          min={0}
          showTip
          step={props.tick}
          value={props.quantity}
          onValueChange={(value) => {
            props.onQuantityChange?.(value);
          }}
        />
      </Flex>
      <Flex justify={"between"}>
        <Text.numeral rule={"percentages"} color={"primaryLight"} size={"2xs"}>
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
            <Text color={"primaryLight"} size={"2xs"}>
              Max
            </Text>
          </button>
          <Text.numeral
            rule={"price"}
            size={"2xs"}
            intensity={54}
            tick={props.tick}
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
  quote_db?: number;
  onPriceChange: TPSLBuilderState["setOrderPrice"];
  onPnLChange: TPSLBuilderState["setPnL"];
  tp_values: PNL_Values;
  sl_values: PNL_Values;
  tp_trigger_price?: number | string;
  sl_trigger_price?: number | string;
  errors: Record<string, { message: string }> | null;
}) => {
  const onPnLChange = (key: string, value: number | string) => {
    // console.log(key, value);
    props.onPnLChange(key, value);
  };
  return (
    <>
      <div>
        <Flex justify={"between"}>
          <Text size={"sm"} intensity={80}>
            Task profit
          </Text>
          <Flex>
            <Text size={"2xs"} intensity={36}>
              Est. PNL:
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
            error={props.errors?.tp_trigger_price?.message}
            onValueChange={(value) => {
              props.onPriceChange("tp_trigger_price", value);
            }}
          />
          <PnlInputWidget
            type={"TP"}
            onChange={onPnLChange}
            quote={props.quote}
            quote_dp={props.quote_db}
            values={props.tp_values}
          />
        </Grid>
      </div>
      <div>
        <Flex justify={"between"}>
          <Text size={"sm"} intensity={80}>
            Stop loss
          </Text>
          <Flex>
            <Text size={"2xs"} intensity={36}>
              Est. PNL:
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
            error={props.errors?.sl_trigger_price?.message}
            onValueChange={(value) => {
              props.onPriceChange("sl_trigger_price", value);
            }}
          />
          <PnlInputWidget
            type={"SL"}
            onChange={onPnLChange}
            quote={props.quote}
            quote_dp={props.quote_db}
            values={props.sl_values}
          />
        </Grid>
      </div>
    </>
  );
};
// ------------ TP/SL Price and PNL input end------------
// ------------ TP/SL Price input start------------
const PriceInput = (props: {
  type: string;
  value?: string | number;
  error?: string;
  onValueChange: (value: string) => void;
}) => {
  const [placeholder, setPlaceholder] = useState<string>("USDC");
  return (
    <Input.tooltip
      prefix={`${props.type} price`}
      size={{
        initial: "lg",
        lg: "md",
      }}
      tooltip={props.error}
      placeholder={placeholder}
      align={"right"}
      autoComplete={"off"}
      value={props.value}
      color={props.error ? "danger" : undefined}
      classNames={{
        prefix: "oui-text-base-contrast-54",
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
        inputFormatter.dpFormatter(2),
        inputFormatter.currencyFormatter,
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
  } = props;
  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_position_tp_sl_confirm",
    true
  );
  const textClassName = textVariants({
    size: "xs",
    intensity: 54,
  });

  console.log("PositionTPSLConfirm", qty, maxQty);

  const isPositionTPSL = qty >= maxQty;

  return (
    <>
      {isEditing && (
        <Text
          as="div"
          size="2xs"
          intensity={80}
          className="oui-mb-3"
        >{`You agree to edit your ${transSymbolformString(
          symbol
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
            <Badge size="xs" color={"primaryLight"}>
              Position
            </Badge>
          )}

          {/* <Badge size="xs" color="neutral">
            TP/SL
          </Badge> */}
          <TPSLOrderType tpPrice={tpPrice} slPrice={slPrice} />
          {side === OrderSide.SELL ? (
            <Badge size="xs" color="success">
              Buy
            </Badge>
          ) : (
            <Badge size="xs" color="danger">
              Sell
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
        pb={5}
        className={textClassName}
      >
        <Flex>
          <Box grow>Qty.</Box>

          <div>
            {isPositionTPSL ? (
              <span className="oui-text-base-contrast">Entire position</span>
            ) : (
              <Text.numeral intensity={98} dp={baseDP}>
                {qty}
              </Text.numeral>
            )}
          </div>
        </Flex>
        {typeof tpPrice === "number" && tpPrice > 0 ? (
          <Flex>
            <Box grow>TP Price</Box>
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
            <Box grow>SL Price</Box>
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
          <Box grow>Price</Box>
          <div className="oui-text-base-contrast">Market</div>
        </Flex>
      </Flex>
      <Box py={2}>
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
            Disable order confirmation
          </label>
        </Flex>
      </Box>
    </>
  );
};

//------------- Position TP/SL Confirm dialog end------------

const TPSLOrderType = (props: { tpPrice?: number; slPrice?: number }) => {
  const { tpPrice, slPrice } = props;
  if (!!tpPrice && !!slPrice) {
    return (
      <Badge size="xs" color="neutral">
        TP/SL
      </Badge>
    );
  }

  if (!!tpPrice) {
    return (
      <Badge size="xs" color="neutral">
        TP
      </Badge>
    );
  }

  if (!!slPrice) {
    return (
      <Badge size="xs" color="neutral">
        SL
      </Badge>
    );
  }

  return null;
};
