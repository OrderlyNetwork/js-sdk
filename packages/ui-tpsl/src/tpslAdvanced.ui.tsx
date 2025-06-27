import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { OrderSide, OrderType, PositionType } from "@orderly.network/types";
import { Button, cn, Divider, Flex, Grid, Text } from "@orderly.network/ui";
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
  const { parseErrorMsg } = useOrderEntryFormErrorMsg(null);
  const { order: formattedOrder, setOrderValue } = props;
  const side = useMemo(() => {
    if (formattedOrder.side === OrderSide.BUY) {
      return "Buy";
    }
    return "Sell";
  }, [formattedOrder.side]);
  console.log("side", side);
  const values = {
    position_type: formattedOrder.position_type ?? PositionType.PARTIAL,
    tp: {
      trigger_price: formattedOrder.tp_trigger_price ?? "",
      PnL: formattedOrder.tp_pnl ?? "",
      Offset: formattedOrder.tp_offset ?? "",
      "Offset%": formattedOrder.tp_offset_percentage ?? "",
      ROI: formattedOrder.tp_ROI ?? "",
      order_price: formattedOrder.tp_order_price ?? "",
    },
    sl: {
      trigger_price: formattedOrder.sl_trigger_price ?? "",
      PnL: formattedOrder.sl_pnl ?? "",
      Offset: formattedOrder.sl_offset ?? "",
      "Offset%": formattedOrder.sl_offset_percentage ?? "",
      ROI: formattedOrder.sl_ROI ?? "",
      order_price: formattedOrder.sl_order_price ?? "",
    },
  };
  console.log("xxx formated order in tspl advanced", formattedOrder);
  return (
    <div className="oui-py-3">
      <div className="oui-px-3">
        <Flex className="oui-text-base-contrast-80 oui-text-base  oui-mb-5">
          TP/SL
        </Flex>

        <OrderInfo order={formattedOrder} />
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
            onChange={() => {}}
          />
        </div>
        <Flex direction={"column"} gap={6}>
          <TPSLInputRowWidget
            type="tp"
            values={values.tp}
            onChange={() => {}}
          />
          <TPSLInputRowWidget
            type="sl"
            values={values.sl}
            onChange={() => {}}
          />
        </Flex>

        <Flex
          direction={"column"}
          itemAlign={"start"}
          className="oui-w-full oui-text-2xs oui-text-base-contrast-36 oui-gap-[6px] oui-mt-6"
        >
          <Flex justify={"between"} className="oui-w-full">
            <Text size="2xs">Total est. TP PnL</Text>
            <Text.formatted
              suffix="USDC"
              rule="price"
              className="oui-text-base-contrast-80"
              size="2xs"
            >
              22
            </Text.formatted>
          </Flex>
          <Text>Total est. SL PnL</Text>

          <Text>Risk reward ratio</Text>
        </Flex>
        <Flex className="oui-mt-6" gap={2}>
          <Button
            size="md"
            fullWidth
            color="gray"
            variant="outlined"
            className="oui-text-base-contrast-36"
          >
            {t("common.cancel")}
          </Button>
          <Button
            size="md"
            fullWidth
            color="success"
            className="oui-text-base-contrast-80"
          >
            Submit
          </Button>
        </Flex>
      </div>
    </div>
  );
};
