import React, { useMemo } from "react";
import { ERROR_MSG_CODES } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { useOrderEntryFormErrorMsg } from "@veltodefi/react-app";
import {
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
} from "@veltodefi/types";
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
  ExclamationFillIcon,
  DotStatus,
} from "@veltodefi/ui";
import { CloseToLiqPriceIcon } from "../components/closeLiqPriceIcon";
import { OrderInfo } from "../components/orderInfo";
import { PnlInfo } from "../components/pnlInfo";
import { TPSLInputRowWidget } from "../components/tpslInputRow";
import { TPSLPositionTypeWidget } from "../components/tpslPostionType";
import { TPSLQuantity } from "../components/tpslQty";
import { TPSLBuilderState } from "./useTPSL.script";

export type TPSLProps = {
  close?: () => void;
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
    isEditing,
  } = props;

  const { errors, validated } = props.metaState;
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  // Filter errors for TP and SL components separately
  const tpErrors = useMemo(() => {
    if (!errors) return null;
    const { sl_trigger_price, ...rest } = errors;
    return rest;
  }, [errors]);

  const slErrors = useMemo(() => {
    if (!errors) return null;
    const { tp_trigger_price, ...rest } = errors;
    return rest;
  }, [errors]);

  const { getErrorMsg } = useOrderEntryFormErrorMsg(errors);
  const { getErrorMsg: getSlPriceErrorMsg } = useOrderEntryFormErrorMsg(
    props.slPriceError,
  );

  const isSlPriceWarning =
    props.slPriceError?.sl_trigger_price?.type ===
    ERROR_MSG_CODES.SL_PRICE_WARNING;

  if (!position) {
    return null;
  }

  const tpslEnable =
    TPSL_OrderEntity.tp_trigger_price || TPSL_OrderEntity.sl_trigger_price;

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
            estLiqPrice={props.estLiqPrice}
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
              <DotStatus
                color="warning"
                size="xs"
                label={t("tpsl.positionType.full.tips.market")}
              />
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
                // enable: TPSL_OrderEntity.tp_enable ?? false,
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
              errors={validated ? tpErrors : null}
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
              inputWarnNode={
                isSlPriceWarning && (
                  <DotStatus
                    color="warning"
                    label={getSlPriceErrorMsg("sl_trigger_price")}
                    classNames={{
                      root: "oui-mt-1",
                    }}
                  />
                )
              }
              symbol={position.symbol}
              rootOrderPrice={position.average_open_price.toString()}
              type="sl"
              side={position.position_qty > 0 ? OrderSide.BUY : OrderSide.SELL}
              values={{
                // enable: TPSL_OrderEntity.sl_enable ?? false,
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
              errors={validated ? slErrors : null}
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
            onCancel?.();
          }}
        >
          {t("common.cancel")}
        </Button>
        <ThrottledButton
          size={"md"}
          data-testid={"tpsl-confirm"}
          disabled={status.isCreateMutating || !tpslEnable}
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
