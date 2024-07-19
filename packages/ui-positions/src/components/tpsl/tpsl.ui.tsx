import {
  Button,
  Divider,
  Flex,
  Grid,
  Input,
  Slider,
  Text,
  cn,
  inputFormatter,
} from "@orderly.network/ui";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { TPSLBuilderState } from "./useTPSL.script";
import { useRef } from "react";

export const TPSL = (props: TPSLBuilderState) => {
  // console.log("TPSL", props);
  const { TPSL_OrderEntity, symbolInfo } = props;
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
      />
      <Grid cols={2} gap={3} mt={4}>
        <Button size={"md"} color={"secondary"}>
          Cancel
        </Button>
        <Button size={"md"}>Confirm</Button>
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
}) => {
  const onPnLChange = (key: string, value: number | string) => {
    console.log(key, value);
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
          <PriceInput type={"TP"} />
          <PnlInputWidget
            type={"TP"}
            onChange={onPnLChange}
            quote={props.quote}
            quote_dp={props.quote_db}
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
          <PriceInput type={"SL"} />
          <PnlInputWidget
            type={"SL"}
            onChange={onPnLChange}
            quote={props.quote}
            quote_dp={props.quote_db}
          />
        </Grid>
      </div>
    </>
  );
};
// ------------ TP/SL Price and PNL input end------------
// ------------ TP/SL Price input start------------
const PriceInput = (props: { type: string }) => {
  return (
    <Input
      prefix={`${props.type} price`}
      size={"md"}
      placeholder={"USDC"}
      align={"right"}
      autoComplete={"off"}
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
