import { OrderValidationResult } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import {
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
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
} from "@orderly.network/ui";
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
export const TPSL = (props: TPSLBuilderState & TPSLProps) => {
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
          dp={symbolInfo("base_dp")}
          onQuantityChange={props.setQuantity}
          quote={symbolInfo("base")}
          isEditing={props.isEditing}
          errorMsg={validated ? getErrorMsg("quantity") : undefined}
        />
      </Box>
    );
  };

  return (
    <div id="orderly-tp_sl-order-edit-content">
      <ScrollArea className={cn(isMobile && "oui-h-[calc(100vh-200px)]")}>
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
          className="oui-w-full oui-mb-3"
        >
          {!isEditing && (
            <TPSLPositionTypeWidget
              disableSelector
              value={TPSL_OrderEntity.position_type ?? PositionType.PARTIAL}
              onChange={(key, value) => {
                if (value === PositionType.FULL) {
                  setValues({
                    position_type: value,
                    quantity: Math.abs(position.position_qty).toString(),
                    tp_order_price: "",
                    tp_order_type: OrderType.MARKET,
                    tp_trigger_price: "",
                    sl_order_price: "",
                    sl_order_type: OrderType.MARKET,
                    sl_trigger_price: "",
                  });
                } else {
                  setValues({
                    position_type: value,
                    quantity: "",
                    tp_order_price: "",
                    tp_order_type: OrderType.MARKET,
                    tp_trigger_price: "",
                    sl_order_price: "",
                    sl_order_type: OrderType.MARKET,
                    sl_trigger_price: "",
                  });
                }
              }}
            />
          )}
          {TPSL_OrderEntity.position_type === PositionType.FULL && (
            <Text className="oui-text-warning oui-text-2xs">
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
          className="oui-w-full oui-mt-3"
        >
          <TPSLInputRowWidget
            symbol={position.symbol}
            rootOrderPrice={position.average_open_price.toString()}
            type="tp"
            values={{
              enable: TPSL_OrderEntity.tp_enable ?? true,
              trigger_price:
                TPSL_OrderEntity.tp_trigger_price?.toString() ?? undefined,
              PnL: TPSL_OrderEntity.tp_pnl?.toString() ?? undefined,
              Offset: TPSL_OrderEntity.tp_offset?.toString() ?? undefined,
              "Offset%":
                TPSL_OrderEntity.tp_offset_percentage?.toString() ?? undefined,
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
              console.log("key", key, "value", value);
              props.setOrderValue(key as keyof OrderlyOrder, value);
            }}
            symbolLeverage={position.leverage}
          />

          <TPSLInputRowWidget
            symbol={position.symbol}
            rootOrderPrice={position.average_open_price.toString()}
            type="sl"
            values={{
              enable: TPSL_OrderEntity.sl_enable ?? true,
              trigger_price:
                TPSL_OrderEntity.sl_trigger_price?.toString() ?? undefined,
              PnL: TPSL_OrderEntity.sl_pnl?.toString() ?? undefined,
              Offset: TPSL_OrderEntity.sl_offset?.toString() ?? undefined,
              "Offset%":
                TPSL_OrderEntity.sl_offset_percentage?.toString() ?? undefined,
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
              console.log("key", key, "value", value);
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
      </ScrollArea>
      <Grid cols={2} gap={3} mt={4}>
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
