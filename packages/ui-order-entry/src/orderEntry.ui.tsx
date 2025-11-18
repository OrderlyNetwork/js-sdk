import React, { useCallback, useEffect, useId, useMemo, useState } from "react";
import {
  ERROR_MSG_CODES,
  OrderValidationResult,
  useLocalStorage,
  useMemoizedFn,
  useOrderlyContext,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import {
  OrderlyOrder,
  OrderSide,
  OrderType,
  PositionType,
} from "@orderly.network/types";
import {
  Box,
  cn,
  Divider,
  Flex,
  modal,
  SimpleSheet,
  Switch,
  ThrottledButton,
  toast,
  useScreen,
} from "@orderly.network/ui";
import { TPSLAdvancedWidget } from "@orderly.network/ui-tpsl";
import { Decimal } from "@orderly.network/utils";
import { AdditionalConfigButton } from "./components/additional/additionalConfigButton";
import {
  AdditionalInfo,
  AdditionalInfoProps,
} from "./components/additional/additionalInfo";
import { PinButton } from "./components/additional/pinButton";
import { AdvancedTPSLResult } from "./components/advancedTPSLResult";
import { AssetInfo } from "./components/assetInfo";
import { Available } from "./components/available";
import { orderConfirmDialogId } from "./components/dialog/confirm.ui";
import { MaxQtyConfirm } from "./components/dialog/maxQtyConfirm";
import { scaledOrderConfirmDialogId } from "./components/dialog/scaledOrderConfirm";
import { OrderEntryHeader } from "./components/header";
import { OrderEntryProvider } from "./components/orderEntryProvider";
import { OrderInput } from "./components/orderInput";
import { QuantitySlider } from "./components/quantitySlider";
import { ReduceOnlySwitch } from "./components/reduceOnlySwitch";
import { OrderTPSL } from "./components/tpsl";
import { type OrderEntryScriptReturn } from "./orderEntry.script";
import { getScaledPlaceOrderMessage } from "./utils";

type OrderEntryProps = OrderEntryScriptReturn & {
  containerRef?: React.RefObject<HTMLDivElement>;
  disableFeatures?: ("slippageSetting" | "feesInfo")[];
};

export const OrderEntry: React.FC<OrderEntryProps> = (props) => {
  const {
    side,
    formattedOrder,
    setOrderValue,
    setOrderValues,
    symbolInfo,
    maxQty,
    freeCollateral,
    helper,
    submit,
    metaState,
    bboStatus,
    bboType,
    onBBOChange,
    toggleBBO,
    disableFeatures,
    currentLtv,
    fillMiddleValue,
    soundAlert,
    setSoundAlert,
    currentFocusInput,
  } = props;
  const [maxQtyConfirmOpen, setMaxQtyConfirmOpen] = useState(false);

  const { t } = useTranslation();

  const { isMobile } = useScreen();
  const [hasAdvancedTPSLResult, setHasAdvancedTPSLResult] =
    useState<boolean>(false);

  const { errors, validated } = metaState;

  const [errorMsgVisible, setErrorMsgVisible] = useState(false);

  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true,
  );
  const [pinned, setPinned] = useLocalStorage(
    "orderly-order-additional-pinned",
    true,
  );
  const [showTPSLAdvanced, setShowTPSLAdvanced] = useState(false);
  const [hidden, setHidden] = useLocalStorage("orderly-order-hidden", false);

  const [slippage, setSlippage] = useLocalStorage("orderly-slippage", "1", {
    parseJSON: ((value: string | null) => {
      return !value || value === '""' ? "1" : JSON.parse(value);
    }) as any,
  });

  const { notification } = useOrderlyContext();

  const soundAlertId = useId();

  const { getErrorMsg } = useOrderEntryFormErrorMsg(validated ? errors : null);

  const buttonLabel = useMemo(() => {
    return side === OrderSide.BUY
      ? t("orderEntry.buyLong")
      : t("orderEntry.sellShort");
  }, [side, t]);

  useEffect(() => {
    if (validated) {
      setErrorMsgVisible(true);
    }
  }, [validated]);

  // set slippage
  useEffect(() => {
    if (disableFeatures?.includes("slippageSetting")) {
      return;
    }
    if (slippage) {
      setOrderValue("slippage", Number(slippage));
    } else {
      setOrderValue("slippage", undefined);
    }
  }, [slippage, disableFeatures]);

  useEffect(() => {
    const clickHandler = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (
        target.closest("#order-entry-submit-button")
        // || target.closest(".orderly-order-entry")
      ) {
        return;
      }
      setErrorMsgVisible((visible) => {
        if (visible) {
          return false;
        }
        return visible;
      });
    };

    if (errorMsgVisible) {
      document.addEventListener("click", clickHandler);
    } else {
      document.removeEventListener("click", clickHandler);
    }

    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }, [errorMsgVisible]);

  const onSubmit = useMemoizedFn(async () => {
    const isScaledOrder = formattedOrder.order_type === OrderType.SCALED;

    const isSlPriceError =
      props.slPriceError?.sl_trigger_price?.type ===
      ERROR_MSG_CODES.SL_PRICE_ERROR;
    helper
      .validate(isSlPriceError ? props.slPriceError : undefined)
      .then(
        // validate success, it return the order
        // TODO: get order from other function
        (order: any) => {
          // scaled order is always need confirm
          if (isScaledOrder) {
            return modal.show(scaledOrderConfirmDialogId, {
              order,
              symbolInfo,
              size: isMobile ? "sm" : "md",
            });
          }

          if (needConfirm) {
            return modal.show(orderConfirmDialogId, {
              order: formattedOrder,
              symbolInfo,
            });
          }

          return true;
        },
        // should catch validate error first, then submit
        (errors: OrderValidationResult) => {
          // slippage error message is not show input tooltip, so we need to manually show it by toast
          if (errors.slippage) {
            toast.error(t("orderEntry.slippage.error.max"));
          }

          // when switch order type, validated not changed, so we need to set it to true
          setErrorMsgVisible(true);

          return Promise.reject();
        },
      )
      .then(() => {
        // validate success, submit order
        return submit({ resetOnSuccess: false }).then((result: any) => {
          if (!result.success && result.message) {
            toast.error(result.message);
          } else if (result.success && isScaledOrder) {
            const message = getScaledPlaceOrderMessage(result);
            if (message) {
              toast.success(message);
            }
          }
        });
      })
      .catch((error) => {
        // submit order error
        if (error?.message) {
          toast.error(error.message);
          // toast.error(`Error:${error.message}`);

          // if (error instanceof ApiError) {
          // toast.error(error.message);
        }
      });
  });

  const formattedMaxQty = useMemo(() => {
    return new Decimal(maxQty)
      .todp(symbolInfo.base_dp, Decimal.ROUND_DOWN)
      .toString();
  }, [maxQty, symbolInfo.base_dp]);

  const onMaxQtyConfirm = useCallback(() => {
    setOrderValue("order_quantity", formattedMaxQty);
    // submit order when order_quantity updated
    requestAnimationFrame(() => {
      onSubmit();
    });
    setMaxQtyConfirmOpen(false);
  }, [setOrderValue, formattedMaxQty]);

  const validateSubmit = async () => {
    // show a prompt reminding the user. If the user confirms, automatically disable Reduce Only and proceed with the action.
    if (formattedOrder.reduce_only && maxQty === 0) {
      return modal.confirm({
        title: t("orderEntry.reduceOnly.reminder"),
        content: t("orderEntry.reduceOnly.reminder.content"),
        okLabel: t("orderEntry.placeOrderNow"),
        onOk: async () => {
          setOrderValue("reduce_only", false);
          // submit order when reduce only updated
          requestAnimationFrame(() => {
            props.resetMetaState();
            onSubmit();
          });
          return Promise.resolve(true);
        },
        onCancel: async () => {
          return Promise.resolve(false);
        },
      });
    } else if (maxQty > 0 && Number(formattedOrder.order_quantity) > maxQty) {
      setMaxQtyConfirmOpen(true);
    } else {
      onSubmit();
    }
  };

  const onShowTPSLAdvanced = () => {
    helper.validate().then(
      () => {
        setShowTPSLAdvanced(true);
      },
      (errors) => {
        const tpslKey = new Set(["tp_trigger_price", "sl_trigger_price"]);
        if (Object.keys(errors).every((key: string) => tpslKey.has(key))) {
          setShowTPSLAdvanced(true);
        }
      },
    );
    // modal.show(TPSLAdvancedDialogId, {
    //   order: formattedOrder,
    //   setOrderValue: setOrderValue,
    // });
    // setShowTPSLAdvanced(true);
  };

  const onSubmitAdvancedTPSL = (order: OrderlyOrder) => {
    if (order.side !== formattedOrder.side) {
      setOrderValue("side", order.side);
    }
    setOrderValues({
      position_type: order.position_type,
      tp_order_type: order.tp_order_type,
      tp_pnl: order.tp_pnl,
      tp_offset: order.tp_offset,
      tp_offset_percentage: order.tp_offset_percentage,
      tp_ROI: order.tp_ROI,
      tp_trigger_price: order.tp_trigger_price,
      tp_order_price: order.tp_order_price,
      sl_order_type: order.sl_order_type,
      sl_trigger_price: order.sl_trigger_price,
      sl_order_price: order.sl_order_price,
      sl_pnl: order.sl_pnl,
      sl_offset: order.sl_offset,
      sl_offset_percentage: order.sl_offset_percentage,
      sl_ROI: order.sl_ROI,
    });
    setShowTPSLAdvanced(false);
    setHasAdvancedTPSLResult(true);
  };

  const onDeleteAdvancedTPSL = () => {
    setHasAdvancedTPSLResult(false);
    setOrderValues({
      tp_trigger_price: undefined,
      tp_order_price: undefined,
      tp_order_type: OrderType.MARKET,
      sl_trigger_price: undefined,
      sl_order_price: undefined,
      sl_order_type: OrderType.MARKET,
      tp_pnl: undefined,
      sl_pnl: undefined,
      position_type: PositionType.FULL,
    });
  };

  useEffect(() => {
    setHasAdvancedTPSLResult(false);
  }, [props.symbol]);

  const showSoundSection =
    Boolean(notification?.orderFilled?.media) &&
    (notification?.orderFilled?.displayInOrderEntry ?? true);

  const additionalInfoProps: AdditionalInfoProps = {
    pinned,
    setPinned,
    needConfirm,
    setNeedConfirm,
    hidden,
    setHidden,
    onValueChange: setOrderValue,
    orderTypeExtra: formattedOrder["order_type_ext"],
    showExtra:
      formattedOrder["order_type"] === OrderType.LIMIT && !props.tpslSwitch,
  };
  // Additional info （fok，ioc、post only， order confirm hidden）
  const extraButton = !pinned && (
    <AdditionalConfigButton {...additionalInfoProps} />
  );

  return (
    <OrderEntryProvider
      errors={errors}
      errorMsgVisible={errorMsgVisible}
      symbolInfo={symbolInfo}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      getErrorMsg={getErrorMsg}
      setOrderValue={setOrderValue}
      setOrderValues={setOrderValues}
      currentFocusInput={currentFocusInput.current}
      priceInputRef={props.priceInputRef}
      priceInputContainerRef={props.priceInputContainerRef}
      triggerPriceInputRef={props.triggerPriceInputRef}
      activatedPriceInputRef={props.activatedPriceInputRef}
      lastQuantityInputType={props.lastQuantityInputType}
      leverage={props.symbolLeverage}
    >
      <MaxQtyConfirm
        open={maxQtyConfirmOpen}
        onOpenChange={setMaxQtyConfirmOpen}
        maxQty={formattedMaxQty}
        onConfirm={onMaxQtyConfirm}
        base={symbolInfo.base}
      />
      <div
        className={"oui-space-y-2 oui-text-base-contrast-54 xl:oui-space-y-3"}
        ref={props.containerRef}
      >
        <OrderEntryHeader
          symbol={props.symbol}
          canTrade={props.canTrade}
          side={side}
          order_type={formattedOrder.order_type!}
          setOrderValue={setOrderValue}
          symbolLeverage={props.symbolLeverage}
        />

        <Available
          currentLtv={currentLtv}
          canTrade={props.canTrade}
          quote={symbolInfo?.quote}
          freeCollateral={freeCollateral}
        />

        <OrderInput
          values={formattedOrder}
          priceInputContainerWidth={props.priceInputContainerWidth}
          fillMiddleValue={fillMiddleValue}
          bbo={{
            bboStatus,
            bboType,
            onBBOChange,
            toggleBBO,
          }}
        />

        <QuantitySlider
          canTrade={props.canTrade}
          side={props.side}
          order_quantity={formattedOrder.order_quantity}
          maxQty={maxQty}
        />

        {/* Submit button */}
        <ThrottledButton
          fullWidth
          id={"order-entry-submit-button"}
          // color={side === OrderSide.BUY ? "buy" : "sell"}
          data-type={OrderSide.BUY}
          className={cn(
            side === OrderSide.BUY
              ? "orderly-order-entry-submit-button-buy oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
              : "orderly-order-entry-submit-button-sell oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80",
          )}
          onClick={validateSubmit}
          loading={props.isMutating}
          disabled={!props.canTrade}
        >
          {buttonLabel}
        </ThrottledButton>

        {/* Asset info */}
        <AssetInfo
          canTrade={props.canTrade}
          quote={symbolInfo.quote}
          estLiqPrice={props.estLiqPrice}
          estLeverage={props.estLeverage}
          currentLeverage={props.currentLeverage}
          slippage={slippage}
          dp={symbolInfo.quote_dp}
          setSlippage={setSlippage}
          estSlippage={props.estSlippage}
          orderType={formattedOrder.order_type!}
          disableFeatures={disableFeatures}
          symbol={props.symbol}
        />

        <Divider className="oui-w-full" />

        {/* TP SL switch and content */}
        {hasAdvancedTPSLResult ? (
          <AdvancedTPSLResult
            order={formattedOrder}
            symbolInfo={props.symbolInfo}
            errors={validated ? errors : null}
            onEdit={() => {
              setShowTPSLAdvanced(true);
            }}
            onDelete={() => {
              onDeleteAdvancedTPSL();
            }}
          />
        ) : (
          <OrderTPSL
            // onCancelTPSL={props.cancelTP_SL}
            // onEnableTP_SL={props.enableTP_SL}
            quote_dp={props.symbolInfo.quote_dp}
            switchState={props.tpslSwitch}
            onSwitchChanged={props.setTpslSwitch}
            orderType={formattedOrder.order_type!}
            errors={validated ? { ...errors, ...props.slPriceError } : null}
            isReduceOnly={formattedOrder.reduce_only}
            setOrderValue={setOrderValue}
            reduceOnlyChecked={formattedOrder.reduce_only ?? false}
            onReduceOnlyChange={(checked) => {
              setOrderValue("reduce_only", checked);
            }}
            values={{
              position_type:
                formattedOrder.position_type ?? PositionType.PARTIAL,
              tp: {
                trigger_price: formattedOrder.tp_trigger_price ?? "",
                PnL: formattedOrder.tp_pnl ?? "",
                Offset: formattedOrder.tp_offset ?? "",
                "Offset%": formattedOrder.tp_offset_percentage ?? "",
                ROI: formattedOrder.tp_ROI ?? "",
              },
              sl: {
                trigger_price: formattedOrder.sl_trigger_price ?? "",
                PnL: formattedOrder.sl_pnl ?? "",
                Offset: formattedOrder.sl_offset ?? "",
                "Offset%": formattedOrder.sl_offset_percentage ?? "",
                ROI: formattedOrder.sl_ROI ?? "",
              },
            }}
            showTPSLAdvanced={onShowTPSLAdvanced}
            onChange={(key, value) => {
              setOrderValue(key, value);
            }}
          />
        )}

        {((isMobile &&
          ((formattedOrder.order_type !== OrderType.LIMIT &&
            formattedOrder.order_type !== OrderType.MARKET) ||
            formattedOrder.reduce_only)) ||
          !isMobile) && (
          <Flex justify={"between"} itemAlign={"center"} className="oui-mt-2">
            <ReduceOnlySwitch
              checked={formattedOrder.reduce_only ?? false}
              onCheckedChange={(checked) => {
                setOrderValue("reduce_only", checked);
              }}
            />
            {!showSoundSection && extraButton}
          </Flex>
        )}
        {showSoundSection && (
          <Flex justify={"between"} itemAlign={"center"}>
            <Flex itemAlign={"center"} gapX={1}>
              <Switch
                className="oui-h-[14px]"
                id={soundAlertId}
                checked={soundAlert}
                onCheckedChange={(checked) => setSoundAlert(checked)}
              />
              <label htmlFor={soundAlertId} className={"oui-text-xs"}>
                {t("portfolio.setting.soundAlerts")}
              </label>
            </Flex>
            {extraButton}
          </Flex>
        )}
        {!showSoundSection &&
          isMobile &&
          (formattedOrder.order_type == OrderType.LIMIT ||
            formattedOrder.order_type == OrderType.MARKET) &&
          !formattedOrder.reduce_only &&
          !pinned && (
            <Flex className="oui-w-full" justify={"end"}>
              {extraButton}
            </Flex>
          )}
        {/* Additional info （fok，ioc、post only， order confirm hidden） */}
        {pinned && (
          <Box p={2} r={"md"} intensity={700} position={"relative"}>
            <AdditionalInfo {...additionalInfoProps} />
            <PinButton
              onClick={() => {
                setPinned(false);
              }}
              className={"oui-group oui-absolute oui-right-2 oui-top-2"}
              data-testid="oui-testid-orderEntry-pinned-button"
            />
          </Box>
        )}
      </div>

      <SimpleSheet
        open={showTPSLAdvanced}
        onOpenChange={setShowTPSLAdvanced}
        classNames={{
          body: "oui-h-full oui-pb-0 oui-border-none",
          overlay: "!oui-bg-base-10/60",
          content: cn(
            "oui-rounded-[16px] oui-border-none !oui-p-0",
            isMobile
              ? "oui-inset-y-0 oui-right-0 oui-w-[280px]"
              : "!oui-bottom-[40px] oui-right-3 oui-top-[44px] !oui-h-auto oui-w-[360px]",
          ),
        }}
        contentProps={{ side: "right", closeable: false }}
      >
        <TPSLAdvancedWidget
          setOrderValue={setOrderValue}
          order={formattedOrder as OrderlyOrder}
          onSubmit={onSubmitAdvancedTPSL}
          onClose={() => {
            setShowTPSLAdvanced(false);
          }}
          symbolLeverage={props.symbolLeverage}
        />
      </SimpleSheet>
    </OrderEntryProvider>
  );
};
