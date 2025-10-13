import React from "react";
import { OrderValidationResult } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { useOrderEntryFormErrorMsg } from "@kodiak-finance/orderly-react-app";
import {
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
} from "@kodiak-finance/orderly-types";
import {
  Box,
  Button,
  Flex,
  Grid,
  Text,
  cn,
  ThrottledButton,
  ScrollArea,
  useScreen,
} from "@kodiak-finance/orderly-ui";
import { OrderInfo } from "../components/orderInfo";
import { PnlInfo } from "../components/pnlInfo";
import { TPSLInputRowWidget } from "../components/tpslInputRow";
import { TPSLPositionTypeWidget } from "../components/tpslPostionType";
import { TPSLQuantity } from "../components/tpslQty";
import { TPSLBuilderState } from "./useTPSL.script";

export type TPSLProps = {
  close?: () => void;
  onClose?: () => void;
  onCancel?: () => void;
  onComplete?: () => void;
  withTriggerPrice?: boolean;
};

//------------- TPSL form start ---------------
export const TPSL: React.FC<TPSLBuilderState & TPSLProps> = (props) => {
  const {
    TPSL_OrderEntity,
    symbolInfo,
    onCancel,
    onComplete,
    status,
    position,
    setValues,
    onClose,
    isEditing,
  } = props;

  const { errors, validated } = props.metaState;
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  const { getErrorMsg } = useOrderEntryFormErrorMsg(errors);

  if (!position) {
    return null;
  }

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
          base_dp={symbolInfo("base_dp")}
          onQuantityChange={props.setQuantity}
          base={symbolInfo("base")}
          isEditing={props.isEditing}
          errorMsg={validated ? getErrorMsg("quantity") : undefined}
        />
      </Box>
    );
  };

  return (
    <div id="orderly-tp_sl-order-edit-content">
      <ScrollArea className={cn(isMobile && "oui-h-[calc(100vh-200px)]")}>
        <div className="oui-px-2">
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
            symbolLeverage={position.leverage}
          />
          <Flex
            direction="column"
            justify="start"
            itemAlign={"start"}
            gap={3}
            className="oui-mb-3 oui-w-full"
          >
            {!isEditing && (
              <TPSLPositionTypeWidget
                disableSelector
                value={TPSL_OrderEntity.position_type ?? PositionType.PARTIAL}
                onChange={(key, value) => {
                  props.setOrderValue(key as keyof OrderlyOrder, value);
                }}
              />
            )}
            {TPSL_OrderEntity.position_type === PositionType.FULL && (
              <Text className="oui-text-2xs oui-text-warning">
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
            className="oui-mt-3 oui-w-full"
          >
            <TPSLInputRowWidget
              symbol={position.symbol}
              rootOrderPrice={position.average_open_price.toString()}
              type="tp"
              side={position.position_qty > 0 ? OrderSide.BUY : OrderSide.SELL}
              values={{
                enable: TPSL_OrderEntity.tp_enable ?? true,
                trigger_price:
                  TPSL_OrderEntity.tp_trigger_price?.toString() ?? undefined,
                PnL: TPSL_OrderEntity.tp_pnl?.toString() ?? undefined,
                Offset: TPSL_OrderEntity.tp_offset?.toString() ?? undefined,
                "Offset%":
                  TPSL_OrderEntity.tp_offset_percentage?.toString() ??
                  undefined,
                order_price:
                  TPSL_OrderEntity.tp_order_price?.toString() ?? undefined,
                order_type: TPSL_OrderEntity.tp_order_type ?? OrderType.MARKET,
              }}
              hideOrderPrice={
                TPSL_OrderEntity.position_type === PositionType.FULL
              }
              errors={validated ? errors : null}
              disableOrderTypeSelector={isEditing}
              quote_dp={symbolInfo("quote_dp")}
              positionType={
                TPSL_OrderEntity.position_type ?? PositionType.PARTIAL
              }
              onChange={(key, value) => {
                props.setOrderValue(key as keyof OrderlyOrder, value);
              }}
              symbolLeverage={position.leverage}
            />

            <TPSLInputRowWidget
              symbol={position.symbol}
              rootOrderPrice={position.average_open_price.toString()}
              type="sl"
              side={position.position_qty > 0 ? OrderSide.BUY : OrderSide.SELL}
              values={{
                enable: TPSL_OrderEntity.sl_enable ?? true,
                trigger_price:
                  TPSL_OrderEntity.sl_trigger_price?.toString() ?? undefined,
                PnL: TPSL_OrderEntity.sl_pnl?.toString() ?? undefined,
                Offset: TPSL_OrderEntity.sl_offset?.toString() ?? undefined,
                "Offset%":
                  TPSL_OrderEntity.sl_offset_percentage?.toString() ??
                  undefined,
                order_price:
                  TPSL_OrderEntity.sl_order_price?.toString() ?? undefined,
                order_type: TPSL_OrderEntity.sl_order_type ?? OrderType.MARKET,
              }}
              hideOrderPrice={
                TPSL_OrderEntity.position_type === PositionType.FULL
              }
              errors={validated ? errors : null}
              quote_dp={symbolInfo("quote_dp")}
              positionType={
                TPSL_OrderEntity.position_type ?? PositionType.PARTIAL
              }
              disableOrderTypeSelector={isEditing}
              onChange={(key, value) => {
                props.setOrderValue(key as keyof OrderlyOrder, value);
              }}
              symbolLeverage={position.leverage}
            />
          </Flex>
          <PnlInfo
            tp_pnl={TPSL_OrderEntity.tp_pnl}
            sl_pnl={TPSL_OrderEntity.sl_pnl}
            className="oui-my-3"
          />
        </div>
      </ScrollArea>
      <Grid px={2} cols={2} gap={3} mt={4}>
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
          disabled={status.isCreateMutating}
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
