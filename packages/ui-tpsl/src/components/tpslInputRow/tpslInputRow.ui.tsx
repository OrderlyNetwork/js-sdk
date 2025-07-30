import { useMemo } from "react";
import { useSymbolLeverage } from "@orderly.network/hooks";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { OrderType, PositionType } from "@orderly.network/types";
import { Flex, Text, Grid, Checkbox, cn } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { PnlInputWidget } from "../../pnlInput/pnlInput.widget";
import { PriceInput } from "../../tpsl.ui";
import { OrderPriceType } from "../orderPriceType";
import { useTPSLInputRowScript } from "./tpslInputRow.script";

type Props = ReturnType<typeof useTPSLInputRowScript>;
export const TPSLInputRowUI = (props: Props) => {
  const { parseErrorMsg } = useOrderEntryFormErrorMsg(props.errors);
  const { values, positionType } = props;
  const symbolLeverage = useSymbolLeverage(props.symbol);
  const roi = useMemo(() => {
    let _roi = null;
    if (!props.rootOrderPrice) {
      return null;
    }

    if (!values.trigger_price && !values.order_price) {
      return null;
    }
    let _entryPrice = new Decimal(0);
    if (values.order_type === OrderType.MARKET) {
      if (!values.trigger_price) {
        return null;
      }
      _entryPrice = new Decimal(values.trigger_price);
    } else if (values.order_type === OrderType.LIMIT) {
      if (!values.order_price) {
        return null;
      }
      _entryPrice = new Decimal(values.order_price);
    }
    const rootOrderPrice = new Decimal(props.rootOrderPrice);
    _roi = _entryPrice
      .minus(rootOrderPrice)
      .div(rootOrderPrice)
      .mul(symbolLeverage)
      .abs()
      .mul(100)
      .mul(props.type === "tp" ? 1 : -1)
      .toNumber();
    return _roi;
  }, [values, props.rootOrderPrice, symbolLeverage, props.type]);

  return (
    <Flex
      direction={"column"}
      gap={2}
      itemAlign={"start"}
      justify={"start"}
      className="oui-w-full"
    >
      <Flex className="oui-w-full" itemAlign={"center"} justify={"start"}>
        <Checkbox
          data-testid={`oui-testid-orderEntry-${props.type}-enable-checkBox`}
          id={`enable_${props.type}`}
          color={"white"}
          checked={values.enable}
          onCheckedChange={(checked: boolean) => {
            props.onChange(`${props.type}_enable`, !!checked);
          }}
        />
        <label
          htmlFor={`enable_${props.type}`}
          className={
            "oui-ml-1 oui-text-sm oui-text-base-contrast-36 oui-cursor-pointer"
          }
        >
          {props.type === "tp" ? "Take profit" : "Stop loss"}
        </label>
      </Flex>
      <Flex
        direction={"column"}
        gap={2}
        itemAlign={"start"}
        className={cn("oui-w-full", values.enable ? "" : "oui-hidden")}
      >
        <Flex
          direction={"column"}
          itemAlign={"start"}
          className="oui-w-full oui-gap-0.5"
        >
          <Text className="oui-text-2xs oui-text-base-contrast-54">
            Trigger price
          </Text>
          <Grid cols={2} gap={2}>
            <PriceInput
              type={`${props.type} price`}
              value={values.trigger_price}
              error={parseErrorMsg(`${props.type}_trigger_price`)}
              onValueChange={(value) => {
                props.onChange(`${props.type}_trigger_price`, value);
              }}
              quote_dp={props.quote_dp}
            />
            <PnlInputWidget
              type={props.type === "tp" ? "TP" : "SL"}
              onChange={(key, value) => {
                console.log("key", key, "value", value);
                props.onChange(key, value as string);
              }}
              quote={"USDC"}
              quote_dp={props.quote_dp}
              values={values}
            />
          </Grid>
        </Flex>
        <Flex
          direction={"column"}
          className={cn(
            "oui-w-full oui-gap-0.5",
            props.hideOrderPrice ? "oui-hidden" : "",
          )}
          itemAlign={"start"}
        >
          <Text className="oui-text-2xs oui-text-base-contrast-54">
            Order price
          </Text>

          <Grid cols={2} gap={2} className="oui-w-full">
            <PriceInput
              disabled={
                positionType === PositionType.FULL ||
                values.order_type === OrderType.MARKET
              }
              type={"order price"}
              label={values.order_type === OrderType.LIMIT ? "Limit" : "Market"}
              value={values.order_price}
              error={parseErrorMsg(`${props.type}_order_price`)}
              onValueChange={(value) => {
                props.onChange(`${props.type}_order_price`, value);
              }}
              quote_dp={props.quote_dp}
            />
            <OrderPriceType
              disabled={
                positionType === PositionType.FULL ||
                props.disableOrderTypeSelector
              }
              type={values.order_type}
              onChange={(value) => {
                props.onChange(`${props.type}_order_type`, value as OrderType);
              }}
            />
          </Grid>
        </Flex>
      </Flex>
      <RenderROI
        price={
          values.order_type === OrderType.MARKET
            ? values.trigger_price
            : values.order_price
        }
        pnl={values.PnL}
        roi={roi}
        dp={props.quote_dp}
      />
    </Flex>
  );
};

const RenderROI = (props: {
  className?: string;
  price: number | string | undefined;
  pnl: number | string | undefined;
  roi: number | null;
  dp: number;
}) => {
  const { price, pnl, roi, dp } = props;
  if (!roi || !price || !pnl) {
    return null;
  }
  return (
    <Text
      className={cn("oui-text-2xs oui-text-base-contrast-36", props.className)}
    >
      When the mark price reaches 
      <Text.numeral
        className="oui-text-base-contrast oui-px-1"
        dp={dp}
        suffix={<Text className="oui-pl-0.5">USDC</Text>}
      >
        {price}
      </Text.numeral>
      , it will trigger a
      <Text className="oui-text-base-contrast oui-px-1">Market</Text>order, and
      estimated PnL will be
      <Text.numeral
        coloring
        className="oui-px-1 oui-whitespace-nowrap"
        dp={2}
        suffix={<Text className="oui-pl-0.5">USDC</Text>}
      >
        {pnl}
      </Text.numeral>
      and ROI is
      <Text.numeral
        coloring
        className="oui-px-1 oui-whitespace-nowrap"
        dp={2}
        suffix="%"
      >
        {roi}
      </Text.numeral>
      .
    </Text>
  );
};
