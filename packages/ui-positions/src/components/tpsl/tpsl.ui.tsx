import { useRef } from "react";
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
} from "@orderly.network/ui";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { TPSLBuilderState } from "./useTPSL.script";

import { PNL_Values } from "./pnlInput/useBuilder.script";

export type TPSLProps = {
  onCancel?: () => void;
  onComplete?: () => void;
};

export const TPSL = (props: TPSLBuilderState & TPSLProps) => {
  const { TPSL_OrderEntity, symbolInfo, onCancel, onComplete } = props;
  return (
    <div id="orderly-tp_sl-order-edit-content">
      {!props.isEditing && (
        <TPSLQuantity
          maxQty={props.maxQty}
          quantity={(props.orderQuantity ?? props.maxQty) as number}
          tick={symbolInfo("base_tick")}
          onQuantityChange={props.setQuantity}
          quote="BTC"
        />
      )}

      <Divider my={4} intensity={8} />
      <TPSLPrice
        sl_pnl={TPSL_OrderEntity.sl_pnl}
        tp_pnl={TPSL_OrderEntity.tp_pnl}
        quote={symbolInfo("quote")}
        quote_db={symbolInfo("quote_dp")}
        onPriceChange={props.setOrderPrice}
        onPnLChange={props.setPnL}
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
          disabled={!props.valid}
          onClick={() => {
            // if (props.needConfirm) {
            //   //show confirm dialog
            // } else {
            props.onSubmit();
            // }
          }}
        >
          Confirm
        </Button>
      </Grid>
    </div>
  );
};

// ------------- Quantity input start------------
const TPSLQuantity = (props: {
  maxQty: number;
  tick: number;
  quote: string;
  onQuantityChange?: (value: number | string) => void;
  quantity: number;
  setOrderValue?: (key: string, value: number | string) => void;
}) => {
  const isPosition = props.quantity === props.maxQty;
  const inputRef = useRef<HTMLInputElement>(null);

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
            size={"md"}
            align="right"
            value={isPosition ? "" : props.quantity}
            autoComplete="off"
            formatters={[
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
        <Button
          onClick={() => {
            const qty = isPosition ? 0 : props.maxQty;
            props.onQuantityChange?.(qty);
            if (qty === 0) {
              setTPSL();
            }
          }}
          variant={"outlined"}
          size={"md"}
          className={cn(
            isPosition
              ? "oui-border-primary-light oui-text-primary-light hover:oui-bg-primary-light/20"
              : "oui-border-line-12 oui-text-base-contrast-54 hover:oui-bg-base-5"
          )}
        >
          Position
        </Button>
      </Flex>
      <Flex mt={2} itemAlign={"center"} height={"15px"}>
        <Slider.signle
          markCount={5}
          color="primaryLight"
          max={props.maxQty}
          min={0}
          step={props.tick}
          value={props.quantity}
          onValueChange={(value) => {
            props.onQuantityChange?.(value);
          }}
        />
      </Flex>
      <Flex justify={"between"}>
        <Text.numeral rule={"percentages"} color={"primaryLight"} size={"2xs"}>
          0
        </Text.numeral>
        <Flex itemAlign={"center"} gap={1}>
          <button
            className={"oui-leading-none"}
            style={{ lineHeight: 0 }}
            onClick={() => {
              console.log("maxQty", props.maxQty);
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
}) => {
  const onPnLChange = (key: string, value: number | string) => {
    // console.log(key, value);
    props.onPnLChange(key, value);
  };
  return (
    <>
      <div>
        <Flex justify={"between"}>
          <Text size={"sm"}>Task profit</Text>
          <Flex>
            <Text size={"2xs"} intensity={36}>
              Est. PNL:
            </Text>
            <Text.numeral size={"2xs"} coloring showIdentifier>
              {props.tp_pnl ?? "-"}
            </Text.numeral>
          </Flex>
        </Flex>
        <Grid cols={2} gap={2} pt={2} pb={4}>
          <PriceInput
            type={"TP"}
            value={props.tp_trigger_price}
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
          <Text size={"sm"}>Stop loss</Text>
          <Flex>
            <Text size={"2xs"} intensity={36}>
              Est. PNL:
            </Text>
            <Text.numeral size={"2xs"} coloring showIdentifier>
              {props.sl_pnl ?? "-"}
            </Text.numeral>
          </Flex>
        </Flex>
        <Grid cols={2} gap={2} pt={2} pb={4}>
          <PriceInput
            type={"SL"}
            value={props.sl_trigger_price}
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
  onValueChange: (value: string) => void;
}) => {
  return (
    <Input
      prefix={`${props.type} price`}
      size={"md"}
      placeholder={"USDC"}
      align={"right"}
      autoComplete={"off"}
      value={props.value}
      onValueChange={props.onValueChange}
      formatters={[
        inputFormatter.numberFormatter,
        inputFormatter.currencyFormatter,
      ]}
    />
  );
};
// ------------ TP/SL Price input end------------

export const TPSLButton = () => {
  return (
    <Button variant="outlined" size="sm" color="secondary">
      TP/SL
    </Button>
  );
};

export type PositionTPSLConfirmProps = {
  symbol: string;
  isPosition: boolean;
  qty: number;
  tpPrice?: number;
  slPrice?: number;
  // type
};

// ------------ Position TP/SL Confirm dialog start------------
export const PositionTPSLConfirm = (props: PositionTPSLConfirmProps) => {
  const { symbol, tpPrice, slPrice, qty } = props;
  const textClassName = textVariants({
    size: "xs",
    intensity: 54,
  });
  return (
    <>
      <Flex pt={5} pb={4}>
        <Box grow>
          <Text.formatted rule={"symbol"} size="base" showIcon as="div">
            {symbol}
          </Text.formatted>
        </Box>
        <Flex gap={1}>
          <Badge size="xs" color={"primaryLight"}>
            Position
          </Badge>
          <Badge size="xs" color="neutral">
            TP/SL
          </Badge>
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

          <div>Entire position</div>
        </Flex>
        {typeof tpPrice === "number" ? (
          <Flex>
            <Box grow>TP Price</Box>
            <Text.numeral
              as={"div"}
              coloring
              unit={"USDC"}
              size={"sm"}
              unitClassName={"oui-text-base-contrast-54 oui-ml-1"}
            >
              52.32
            </Text.numeral>
          </Flex>
        ) : null}

        <Flex>
          <Box grow>SL Price</Box>
          <Text.numeral
            as={"div"}
            coloring
            unit={"USDC"}
            size={"sm"}
            unitClassName={"oui-text-base-contrast-54 oui-ml-1"}
          >
            52.32
          </Text.numeral>
        </Flex>
        <Flex>
          <Box grow>Price</Box>
          <div>Market</div>
        </Flex>
      </Flex>
      <Box py={2}>
        <Flex gap={1}>
          <Checkbox id="disabledConfirm" />
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
