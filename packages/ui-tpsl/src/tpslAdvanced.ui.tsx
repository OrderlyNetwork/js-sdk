import { useMemo, useState, useEffect } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import {
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import { Button, cn, Divider, Flex, Grid, Text } from "@orderly.network/ui";
import { Decimal } from "@orderly.network/utils";
import { OrderInfo } from "./components/orderInfo";
import { OrderPriceType } from "./components/orderPriceType";
import { TPSLInputRowWidget } from "./components/tpslInputRow";
import { TPSLPositionTypeWidget } from "./components/tpslPostionType";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { PriceInput } from "./tpsl.ui";
import { useTPSLAdvanced } from "./useTPSLAdvanced.script";

type Props = ReturnType<typeof useTPSLAdvanced>;

export const TPSLAdvancedUI = (props: Props) => {
  const { t } = useTranslation();
  const { errors, validated } = props.metaState;
  const { parseErrorMsg } = useOrderEntryFormErrorMsg(errors);

  const {
    formattedOrder,
    setValue: setOrderValue,
    symbolInfo,
    setValues,
  } = props;
  const [tpValues, setTpValuse] = useState<{
    enable: boolean;
    trigger_price: string;
    PnL: string;
    Offset: string;
    "Offset%": string;
    ROI: string;
    order_price: string;
    order_type: OrderType;
  }>({
    enable: true,
    order_type: formattedOrder.tp_order_type ?? OrderType.MARKET,
    order_price: formattedOrder.tp_order_price ?? "",
    trigger_price: formattedOrder.tp_trigger_price ?? "",
    PnL: formattedOrder.tp_pnl ?? "",
    Offset: formattedOrder.tp_offset ?? "",
    "Offset%": formattedOrder.tp_offset_percentage ?? "",
    ROI: formattedOrder.tp_ROI ?? "",
  });

  const [slValues, setSlValues] = useState<{
    enable: boolean;
    trigger_price: string;
    PnL: string;
    Offset: string;
    "Offset%": string;
    ROI: string;
    order_price: string;
    order_type: OrderType;
  }>({
    enable: true,
    order_type: formattedOrder.sl_order_type ?? OrderType.MARKET,
    order_price: formattedOrder.sl_order_price ?? "",
    trigger_price: formattedOrder.sl_trigger_price ?? "",
    PnL: formattedOrder.sl_pnl ?? "",
    Offset: formattedOrder.sl_offset ?? "",
    "Offset%": formattedOrder.sl_offset_percentage ?? "",
    ROI: formattedOrder.sl_ROI ?? "",
  });

  const riskRatio = useMemo(() => {
    if (formattedOrder.tp_pnl && formattedOrder.sl_pnl) {
      const ratio = new Decimal(formattedOrder.tp_pnl)
        .div(formattedOrder.sl_pnl)
        .abs()
        .toNumber()
        .toFixed(2);
      return (
        <Flex
          gap={1}
          itemAlign={"center"}
          className="oui-text-base-contrast-80"
        >
          <Text>{ratio}</Text>
          <Text className="oui-text-base-contrast-36">x</Text>
        </Flex>
      );
    }
    return "-";
  }, [formattedOrder.tp_pnl, formattedOrder.sl_pnl]);

  // Update tpValues when formattedOrder changes
  useEffect(() => {
    console.log("update tpValues", formattedOrder);
    setTpValuse((prev) => ({
      ...prev,
      enable: formattedOrder.tp_enable ?? true,
      order_type: formattedOrder.tp_order_type ?? OrderType.MARKET,
      order_price: formattedOrder.tp_order_price ?? "",
      trigger_price: formattedOrder.tp_trigger_price ?? "",
      PnL: formattedOrder.tp_pnl ?? "",
      Offset: formattedOrder.tp_offset ?? "",
      "Offset%": formattedOrder.tp_offset_percentage ?? "",
      ROI: formattedOrder.tp_ROI ?? "",
    }));
  }, [
    formattedOrder.tp_enable,
    formattedOrder.tp_trigger_price,
    formattedOrder.tp_pnl,
    formattedOrder.tp_offset,
    formattedOrder.tp_offset_percentage,
    formattedOrder.tp_order_type,
    formattedOrder.tp_order_price,
  ]);

  useEffect(() => {
    setSlValues((prev) => ({
      ...prev,
      enable: formattedOrder.sl_enable ?? true,
      order_type: formattedOrder.sl_order_type ?? OrderType.MARKET,
      order_price: formattedOrder.sl_order_price ?? "",
      trigger_price: formattedOrder.sl_trigger_price ?? "",
      PnL: formattedOrder.sl_pnl ?? "",
      Offset: formattedOrder.sl_offset ?? "",
      "Offset%": formattedOrder.sl_offset_percentage ?? "",
      ROI: formattedOrder.sl_ROI ?? "",
    }));
  }, [
    formattedOrder.sl_enable,
    formattedOrder.sl_trigger_price,
    formattedOrder.sl_pnl,
    formattedOrder.sl_offset,
    formattedOrder.sl_offset_percentage,
    formattedOrder.sl_order_type,
    formattedOrder.sl_order_price,
  ]);

  return (
    <div className="oui-py-3">
      <div className="oui-px-3">
        <Flex className="oui-text-base-contrast-80 oui-text-base  oui-mb-5">
          TP/SL
        </Flex>

        <OrderInfo order={formattedOrder as OrderlyOrder} />
      </div>
      <Divider className="oui-my-3" />
      <div className="oui-px-3">
        <Flex className="oui-gap-[6px]">
          <Button
            onClick={() => {
              setOrderValue("side", OrderSide.BUY);
            }}
            size={"md"}
            fullWidth
            data-type={OrderSide.BUY}
            // color={side === OrderSide.BUY ? "buy" : "secondary"}
            className={cn(
              formattedOrder.side === OrderSide.BUY
                ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
                : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
            )}
            data-testid="oui-testid-orderEntry-side-buy-button"
          >
            {t("common.buy")}
          </Button>
          <Button
            onClick={() => {
              setOrderValue("side", OrderSide.SELL);
            }}
            data-type={OrderSide.SELL}
            fullWidth
            size={"md"}
            // color={side === OrderSide.SELL ? "sell" : "secondary"}
            className={cn(
              formattedOrder.side === OrderSide.SELL
                ? "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80"
                : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
            )}
            data-testid="oui-testid-orderEntry-side-sell-button"
          >
            {t("common.sell")}
          </Button>
        </Flex>
        <div className="oui-py-3">
          <TPSLPositionTypeWidget
            value={formattedOrder.position_type ?? PositionType.PARTIAL}
            onChange={(key, value) => {
              // setOrderValue("position_type", value);
              if (value === PositionType.FULL) {
                setValues({
                  position_type: PositionType.FULL,
                  tp_order_type: OrderType.MARKET,
                  sl_order_type: OrderType.MARKET,
                });
                // setOrderValue("tp_order_type", OrderType.MARKET);
                // setOrderValue("sl_order_type", OrderType.MARKET);
                return;
              }
              setOrderValue("position_type", value);
            }}
          />
        </div>
        <Flex direction={"column"} gap={6}>
          <TPSLInputRowWidget
            type="tp"
            values={tpValues}
            errors={validated ? errors : null}
            quote_dp={symbolInfo.quote_dp}
            onChange={(key, value) => {
              console.log("key", key, "value", value);
              // setTpValuse((prev) => ({ ...prev, [key]: value }));
              setOrderValue(key as keyof OrderlyOrder, value);
            }}
            positionType={formattedOrder.position_type ?? PositionType.PARTIAL}
          />
          <TPSLInputRowWidget
            type="sl"
            values={slValues}
            errors={validated ? errors : null}
            quote_dp={symbolInfo.quote_dp}
            positionType={formattedOrder.position_type ?? PositionType.PARTIAL}
            onChange={(key, value) => {
              setOrderValue(key as keyof OrderlyOrder, value);
            }}
          />
        </Flex>

        <Flex
          direction={"column"}
          itemAlign={"start"}
          className="oui-w-full oui-text-2xs oui-text-base-contrast-36 oui-gap-[6px] oui-mt-6"
        >
          <Flex justify={"between"} className="oui-w-full">
            <Text size="2xs">Total est. TP PnL</Text>
            {formattedOrder.tp_pnl ? (
              <Text.numeral
                suffix={<Text className="oui-text-base-contrast-36">USDC</Text>}
                coloring
                visible={true}
                size="2xs"
                dp={2}
              >
                {Number(formattedOrder.tp_pnl)}
              </Text.numeral>
            ) : (
              <Text size="2xs">-- USDC</Text>
            )}
          </Flex>
          <Flex justify={"between"} className="oui-w-full">
            <Text size="2xs">Total est. SL PnL</Text>
            {formattedOrder.sl_pnl ? (
              <Text.numeral
                suffix={
                  <Text className="oui-text-base-contrast-36 oui-ml-1">
                    USDC
                  </Text>
                }
                coloring
                visible={true}
                size="2xs"
                dp={2}
              >
                {Number(formattedOrder.sl_pnl)}
              </Text.numeral>
            ) : (
              <Text size="2xs">-- USDC</Text>
            )}
          </Flex>

          <Flex justify={"between"} className="oui-w-full">
            <Text size="2xs">Risk reward ratio</Text>
            <Text className="oui-text-base-contrast-80" size="2xs">
              {riskRatio}
            </Text>
          </Flex>
        </Flex>
        <Flex className="oui-mt-6" gap={2}>
          <Button
            size="md"
            fullWidth
            color="gray"
            variant="outlined"
            className="oui-text-base-contrast-36"
            onClick={props.onClose}
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="md"
            fullWidth
            color="success"
            className={cn(
              formattedOrder.side === OrderSide.SELL
                ? "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80"
                : "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80",
            )}
            onClick={props.onSubmit}
          >
            Submit
          </Button>
        </Flex>
      </div>
    </div>
  );
};
