import React, { Fragment, useMemo } from "react";
import { useLeverageBySymbol } from "@orderly.network/hooks";
import { useTranslation, Trans } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { OrderType, PositionType } from "@orderly.network/types";
import { Flex, Text, Grid, Checkbox, cn } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { PnlInputWidget } from "../../pnlInput/pnlInput.widget";
import { getDirection } from "../../utils";
import { OrderPriceType } from "../orderPriceType";
import { PriceInput } from "./priceInput";
import { useTPSLInputRowScript } from "./tpslInputRow.script";

type TPSLInputRowProps = ReturnType<typeof useTPSLInputRowScript>;

export const TPSLInputRowUI: React.FC<TPSLInputRowProps> = (props) => {
  const { t } = useTranslation();
  const { getErrorMsg } = useOrderEntryFormErrorMsg(props.errors);
  const { values, positionType } = props;

  // if symbolLeverage is not provided, get it from useLeverageBySymbol
  const symbolLeverage = useLeverageBySymbol(
    props.symbolLeverage ? undefined : props.symbol,
  );

  const leverage = props.symbolLeverage || symbolLeverage;

  const roi = useMemo(() => {
    if (!leverage || isNaN(Number(leverage))) {
      return null;
    }
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

    // ROI = (close price - order_price) / order_price × leverage × direction
    // direction: long: +1 / short: -1
    // leverage = MIN( current_account_leverage, symbol_leverage)
    const direction = getDirection({
      side: props.side,
      type: props.type,
      closePrice: _entryPrice.toNumber(),
      orderPrice: rootOrderPrice.toNumber(),
    });

    _roi = _entryPrice
      .minus(rootOrderPrice)
      .div(rootOrderPrice)
      .mul(leverage)
      .abs()
      .mul(100)
      .mul(direction)
      // .mul(props.type === "tp" ? 1 : -1)
      .toNumber();
    return _roi;
  }, [values, props.rootOrderPrice, symbolLeverage, props.type, props.side]);

  return (
    <Flex
      direction={"column"}
      itemAlign={"start"}
      justify={"start"}
      className="oui-w-full"
    >
      <Flex className="oui-w-full" itemAlign={"center"} justify={"start"}>
        {!props.disableEnableCheckbox && (
          <Checkbox
            data-testid={`oui-testid-orderEntry-${props.type}-enable-checkBox`}
            id={`enable_${props.type}`}
            color={"white"}
            checked={values.enable}
            onCheckedChange={(checked: boolean) => {
              props.onChange(`${props.type}_enable`, !!checked);
            }}
          />
        )}
        <label
          htmlFor={`enable_${props.type}`}
          className={cn(
            "oui-cursor-pointer oui-text-sm",
            props.disableEnableCheckbox
              ? "oui-ml-0 oui-text-base-contrast"
              : "oui-ml-1  oui-text-base-contrast-36",
          )}
        >
          {props.type === "tp"
            ? t("tpsl.advanced.TP.label")
            : t("tpsl.advanced.SL.label")}
        </label>
      </Flex>
      <Flex
        direction={"column"}
        gap={2}
        itemAlign={"start"}
        className={cn("oui-w-full oui-pt-2", values.enable ? "" : "oui-hidden")}
      >
        <Flex
          direction={"column"}
          itemAlign={"start"}
          className="oui-w-full oui-gap-0.5"
        >
          <Text className="oui-text-2xs oui-text-base-contrast-54">
            {t("tpsl.advanced.triggerPrice")}
          </Text>
          <Grid cols={2} gap={2} className="oui-w-full oui-px-0.5">
            <PriceInput
              type={`${props.type} price`}
              value={values.trigger_price}
              error={getErrorMsg(`${props.type}_trigger_price`)}
              onValueChange={(value) => {
                props.onChange(`${props.type}_trigger_price`, value);
              }}
              quote_dp={props.quote_dp}
            />
            <PnlInputWidget
              type={props.type === "tp" ? "TP" : "SL"}
              onChange={(key, value) => {
                props.onChange(key, value as string);
              }}
              quote={"USDC"}
              quote_dp={2}
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
            {t("tpsl.advanced.orderPrice")}
          </Text>
          <Grid cols={2} gap={2} className="oui-w-full oui-px-0.5">
            <PriceInput
              disabled={
                positionType === PositionType.FULL ||
                values.order_type === OrderType.MARKET
              }
              type={"order price"}
              label={
                values.order_type === OrderType.LIMIT
                  ? t("tpsl.advanced.limit")
                  : t("tpsl.advanced.market")
              }
              value={values.order_price}
              error={getErrorMsg(`${props.type}_order_price`)}
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
        orderType={values.order_type}
        pnl={values.PnL}
        roi={roi}
        dp={props.quote_dp}
        className="oui-mt-1"
      />
    </Flex>
  );
};

const RenderROI: React.FC<{
  className?: string;
  price?: number | string;
  pnl?: number | string;
  roi?: number | null;
  dp: number;
  orderType: OrderType;
}> = (props) => {
  const { t } = useTranslation();
  const { price, pnl, roi, dp, className, orderType } = props;
  if (!roi || !price || !pnl) {
    return null;
  }
  return (
    <Text className={cn("oui-text-2xs oui-text-base-contrast-36", className)}>
      <Trans
        i18nKey="tpsl.advanced.ROI"
        components={[
          <Fragment key="price">
            <Text.numeral
              className="oui-px-1 oui-text-base-contrast"
              dp={dp}
              suffix={<Text className="oui-pl-0.5">USDC</Text>}
            >
              {price}
            </Text.numeral>
          </Fragment>,
          <Fragment key="orderType">
            <Text className="oui-px-1 oui-text-base-contrast">
              {orderType === OrderType.MARKET
                ? t("common.market")
                : t("common.limit")}
            </Text>
          </Fragment>,
          <Fragment key="pnl">
            <Text.numeral
              coloring
              className="oui-whitespace-nowrap oui-px-1"
              dp={2}
              suffix={<Text className="oui-pl-0.5">USDC</Text>}
            >
              {pnl}
            </Text.numeral>
          </Fragment>,

          <Fragment key="roi">
            <Text.numeral
              coloring
              className="oui-whitespace-nowrap oui-px-1"
              dp={2}
              suffix="%"
            >
              {roi}
            </Text.numeral>
          </Fragment>,
        ]}
      />
    </Text>
  );
};
