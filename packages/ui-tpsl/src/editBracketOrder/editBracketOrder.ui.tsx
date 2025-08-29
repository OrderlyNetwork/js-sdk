import { useEffect, useState } from "react";
import { useTranslation } from "@orderly.network/i18n";
import {
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import {
  Button,
  cn,
  DialogFooter,
  Divider,
  Flex,
  Grid,
  ScrollArea,
  Text,
  ThrottledButton,
  useScreen,
} from "@orderly.network/ui";
import { OrderInfo } from "../components/orderInfo";
import { PnlInfo } from "../components/pnlInfo";
import { TPSLInputRowWidget } from "../components/tpslInputRow";
import { TPSLPositionTypeWidget } from "../components/tpslPostionType";
import { useEditBracketOrder } from "./editBracketOrder.script";

type Props = ReturnType<typeof useEditBracketOrder>;
export const EditBracketOrderUI = (props: Props & { onClose?: () => void }) => {
  const { t } = useTranslation();
  const { errors, validated } = props.metaState;
  const { isMobile } = useScreen();
  // console.log('errors', errors, validated);

  const {
    formattedOrder,
    setValue: setOrderValue,
    symbol,
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

  // Update tpValues when formattedOrder changes
  useEffect(() => {
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
  }, [formattedOrder]);

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
  }, [formattedOrder]);
  return (
    <div>
      <ScrollArea
        className={cn("oui-flex-1", isMobile && "oui-h-[calc(100vh-200px)]")}
      >
        <div className="">
          <OrderInfo
            order={{
              symbol,
              order_quantity: formattedOrder.order_quantity,
              order_price: formattedOrder.order_price,
            }}
            baseDP={symbolInfo.base_dp}
            quoteDP={symbolInfo.quote_dp}
          />
        </div>
        <Divider className="oui-my-3" />
        <div className="">
          <div className="oui-py-3">
            <TPSLPositionTypeWidget
              value={formattedOrder.position_type ?? PositionType.PARTIAL}
              disableSelector
              onChange={(key, value) => {
                // setOrderValue("position_type", value);
                if (value === PositionType.FULL) {
                  setValues({
                    position_type: PositionType.FULL,
                    tp_order_type: OrderType.MARKET,
                    tp_order_price: undefined,
                    sl_order_type: OrderType.MARKET,
                    sl_order_price: undefined,
                  });
                  // setOrderValue("tp_order_type", OrderType.MARKET);
                  // setOrderValue("sl_order_type", OrderType.MARKET);
                  return;
                }
                setOrderValue("position_type", value);
              }}
            />
            {formattedOrder.position_type === PositionType.FULL && (
              <Flex
                justify={"start"}
                itemAlign={"start"}
                gap={2}
                className="oui-mt-3 oui-w-full"
              >
                <div className="oui-relative oui-top-[7px] oui-size-1 oui-rounded-full oui-bg-[#D25f00]" />
                <Text className="oui-text-2xs oui-text-[#D25f00]">
                  {t("tpsl.positionType.full.tips.market")}
                </Text>
              </Flex>
            )}
          </div>
          <Flex direction={"column"} gap={6}>
            {formattedOrder.tp_enable && (
              <TPSLInputRowWidget
                disableEnableCheckbox
                disableOrderTypeSelector
                rootOrderPrice={formattedOrder.order_price}
                symbol={symbolInfo.symbol}
                type="tp"
                values={tpValues}
                errors={validated ? errors : null}
                quote_dp={symbolInfo.quote_dp}
                hideOrderPrice={
                  formattedOrder.position_type === PositionType.FULL
                }
                onChange={(key, value) => {
                  console.log("key", key, "value", value);
                  // setTpValuse((prev) => ({ ...prev, [key]: value }));
                  setOrderValue(key as keyof OrderlyOrder, value);
                }}
                positionType={
                  formattedOrder.position_type ?? PositionType.PARTIAL
                }
              />
            )}
            {formattedOrder.sl_enable && formattedOrder.tp_enable && (
              <Divider className="oui-w-full" />
            )}
            {formattedOrder.sl_enable && (
              <TPSLInputRowWidget
                disableEnableCheckbox
                disableOrderTypeSelector
                rootOrderPrice={formattedOrder.order_price}
                symbol={symbolInfo.symbol}
                type="sl"
                values={slValues}
                hideOrderPrice={
                  formattedOrder.position_type === PositionType.FULL
                }
                errors={validated ? errors : null}
                quote_dp={symbolInfo.quote_dp}
                positionType={
                  formattedOrder.position_type ?? PositionType.PARTIAL
                }
                onChange={(key, value) => {
                  setOrderValue(key as keyof OrderlyOrder, value);
                }}
              />
            )}
          </Flex>

          <PnlInfo
            tp_pnl={formattedOrder.tp_pnl}
            sl_pnl={formattedOrder.sl_pnl}
            className="oui-mt-6"
          />
        </div>
      </ScrollArea>
      <Flex
        itemAlign={"center"}
        gap={3}
        mt={5}
        width={"100%"}
        justify={"center"}
      >
        <ThrottledButton
          className="oui-w-[184px]"
          data-testid={"tpsl-confirm"}
          disabled={!props.isPriceChanged}
          loading={props.isMutating}
          onClick={() => {
            props
              .onSubmit()
              .then(() => {
                props.onClose?.();
              })
              .catch((err) => {
                console.log("--->>>cancel order", err);
              });
          }}
        >
          {t("common.confirm")}
        </ThrottledButton>
      </Flex>
    </div>
  );
};
