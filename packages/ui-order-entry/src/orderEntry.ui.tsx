import React, {
  CSSProperties,
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  PropsWithChildren,
  ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  OrderValidationResult,
  useLeverage,
  useLocalStorage,
} from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import {
  API,
  BBOOrderType,
  DistributionType,
  OrderLevel,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import {
  Box,
  Button,
  CaretRightIcon,
  cn,
  Divider,
  Flex,
  Grid,
  InfoCircleIcon,
  Input,
  inputFormatter,
  InputProps,
  modal,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Select,
  Slider,
  Switch,
  Text,
  textVariants,
  ThrottledButton,
  toast,
  TokenIcon,
  Tooltip,
  useScreen,
} from "@orderly.network/ui";
import { LeverageWidgetWithSheetId } from "@orderly.network/ui-leverage";
import { commifyOptional, Decimal } from "@orderly.network/utils";
import { LTVRiskTooltipWidget } from "./components/LTVRiskTooltip";
// import { useBalanceScript } from "../../trading/src/components/mobile/bottomNavBar/balance";
import { AdditionalInfoWidget } from "./components/additional/additionnalInfo.widget";
import { orderConfirmDialogId } from "./components/dialog/confirm.ui";
import { scaledOrderConfirmDialogId } from "./components/dialog/scaledOrderConfirm";
import { FeesWidget } from "./components/fees";
import {
  OrderEntryContext,
  OrderEntryProvider,
} from "./components/orderEntryContext";
import { QuantityDistributionInput } from "./components/quantityDistribution";
import { QuantityUnit } from "./components/quantityUnit";
import { SlippageUI } from "./components/slippage/slippage.ui";
import { OrderTPSL } from "./components/tpsl";
import { type OrderEntryScriptReturn } from "./orderEntry.script";
import { InputType } from "./types";
import { BBOStatus, getScaledPlaceOrderMessage } from "./utils";

type Refs = OrderEntryScriptReturn["refs"];

type OrderEntryProps = OrderEntryScriptReturn & {
  containerRef: any;
  disableFeatures?: ("slippageSetting" | "feesInfo")[];
};

export const OrderEntry: React.FC<OrderEntryProps> = (props) => {
  const {
    side,
    formattedOrder,
    setOrderValue,
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
  } = props;

  const { curLeverage } = useLeverage();

  const { t } = useTranslation();

  const { isMobile } = useScreen();

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
  const [hidden, setHidden] = useLocalStorage("orderly-order-hidden", false);

  const [slippage, setSlippage] = useLocalStorage("orderly-slippage", "1", {
    parseJSON: ((value: string | null) => {
      return !value || value === '""' ? "1" : JSON.parse(value);
    }) as any,
  });

  const { parseErrorMsg } = useOrderEntryFormErrorMsg(
    validated ? errors : null,
  );

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
    if (props.disableFeatures?.includes("slippageSetting")) {
      return;
    }

    if (slippage) {
      setOrderValue("slippage", Number(slippage));
    } else {
      setOrderValue("slippage", undefined);
    }
  }, [slippage, props.disableFeatures]);

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

  const onSubmit = () => {
    const isScaledOrder = formattedOrder.order_type === OrderType.SCALED;

    helper
      .validate()
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
        }
      });
  };

  const mergedShowSheet = isMobile && props.canTrade;

  const showLTV =
    typeof currentLtv === "number" &&
    !Number.isNaN(currentLtv) &&
    currentLtv > 0;

  return (
    <OrderEntryProvider value={{ errorMsgVisible }}>
      <div
        className={"oui-space-y-2 oui-text-base-contrast-54 xl:oui-space-y-3"}
        ref={props.containerRef}
      >
        {/* Buy Sell button */}
        <Flex gapX={2} className="oui-flex-col oui-gap-y-3 lg:oui-flex-row">
          <div
            className={cn(
              "oui-grid oui-w-full oui-flex-1 oui-gap-x-2 lg:oui-flex lg:oui-gap-x-[6px]",
              mergedShowSheet ? "oui-grid-cols-3" : "oui-grid-cols-2",
            )}
          >
            <Button
              onClick={() => {
                props.setOrderValue("side", OrderSide.BUY);
              }}
              size={"md"}
              fullWidth
              data-type={OrderSide.BUY}
              // color={side === OrderSide.BUY ? "buy" : "secondary"}
              className={cn(
                side === OrderSide.BUY && props.canTrade
                  ? "oui-bg-success-darken hover:oui-bg-success-darken/80 active:oui-bg-success-darken/80"
                  : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
              )}
              data-testid="oui-testid-orderEntry-side-buy-button"
            >
              {t("common.buy")}
            </Button>
            <Button
              onClick={() => {
                props.setOrderValue("side", OrderSide.SELL);
              }}
              data-type={OrderSide.SELL}
              fullWidth
              size={"md"}
              // color={side === OrderSide.SELL ? "sell" : "secondary"}
              className={cn(
                side === OrderSide.SELL && props.canTrade
                  ? "oui-bg-danger-darken hover:oui-bg-danger-darken/80 active:oui-bg-danger-darken/80"
                  : "oui-bg-base-7 oui-text-base-contrast-36 hover:oui-bg-base-6 active:oui-bg-base-6",
              )}
              data-testid="oui-testid-orderEntry-side-sell-button"
            >
              {t("common.sell")}
            </Button>
            {mergedShowSheet && (
              <Button
                size={"md"}
                fullWidth
                trailing={
                  <CaretRightIcon
                    size={12}
                    className="oui-text-base-contrast-36"
                  />
                }
                onClick={() => {
                  modal.show(LeverageWidgetWithSheetId, {
                    currentLeverage: curLeverage,
                  });
                }}
                className={cn(
                  "oui-bg-base-7 oui-text-primary-light hover:oui-bg-base-6 active:oui-bg-base-6",
                )}
              >
                {commifyOptional(curLeverage, { fix: 2 }) + "x"}
              </Button>
            )}
          </div>
          <div className={"oui-w-full lg:oui-flex-1"}>
            <OrderTypeSelect
              type={formattedOrder.order_type!}
              side={side}
              canTrade={props.canTrade}
              onChange={(type) => {
                setOrderValue("order_type", type);
              }}
            />
          </div>
        </Flex>
        {/* Available */}
        <Flex itemAlign={"center"} justify={"between"}>
          <Text size={"2xs"}>{t("common.available")}</Text>
          <Flex itemAlign={"center"} justify={"center"} gap={1}>
            {showLTV && (
              <Tooltip
                className={"oui-bg-base-6 oui-p-2"}
                content={<LTVRiskTooltipWidget />}
              >
                <InfoCircleIcon
                  className={
                    "oui-cursor-pointer oui-text-warning oui-opacity-80"
                  }
                />
              </Tooltip>
            )}
            <Text.numeral
              unit={symbolInfo.quote}
              size={"2xs"}
              className={"oui-text-base-contrast-80"}
              unitClassName={"oui-ml-1 oui-text-base-contrast-54"}
              dp={2}
              padding={false}
            >
              {props.canTrade ? freeCollateral : 0}
            </Text.numeral>
          </Flex>
        </Flex>
        {/* Inputs (price,quantity,triggerPrice) */}
        {formattedOrder.order_type === OrderType.SCALED ? (
          <ScaledOrderInput
            type={props.type}
            symbolInfo={symbolInfo}
            values={{
              order_quantity: formattedOrder.order_quantity,
              total: formattedOrder.total,
              side: formattedOrder.side,
              end_price: formattedOrder.end_price,
              start_price: formattedOrder.start_price,
              total_orders: formattedOrder.total_orders,
              distribution_type: formattedOrder.distribution_type,
              skew: formattedOrder.skew,
            }}
            onChange={(key, value) => {
              props.setOrderValue(key, value);
            }}
            onValuesChange={props.setOrderValues}
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            parseErrorMsg={parseErrorMsg}
            quantityUnit={props.quantityUnit}
            setQuantityUnit={props.setQuantityUnit}
            errors={errors}
          />
        ) : (
          <OrderQuantityInput
            type={props.type}
            symbolInfo={symbolInfo}
            values={{
              order_quantity: formattedOrder.order_quantity,
              price: formattedOrder.order_price,
              trigger_price: formattedOrder.trigger_price,
              total: formattedOrder.total,
              level: formattedOrder.level,
              side: formattedOrder.side,
              order_type_ext: formattedOrder.order_type_ext,
            }}
            onChange={(key, value) => {
              props.setOrderValue(key, value);
            }}
            onValuesChange={props.setOrderValues}
            refs={props.refs}
            onBlur={props.onBlur}
            onFocus={props.onFocus}
            bbo={{
              bboStatus,
              bboType,
              onBBOChange,
              toggleBBO,
            }}
            priceInputContainerWidth={props.priceInputContainerWidth}
            parseErrorMsg={parseErrorMsg}
            fillMiddleValue={fillMiddleValue}
          />
        )}
        {/* Slider */}
        <QuantitySlider
          canTrade={props.canTrade}
          maxQty={maxQty}
          currentQtyPercentage={props.currentQtyPercentage}
          value={
            !formattedOrder.order_quantity
              ? 0
              : Number(formattedOrder.order_quantity)
          }
          tick={symbolInfo.base_tick}
          dp={symbolInfo.base_dp}
          setMaxQty={props.setMaxQty}
          onValueChange={(value) => {
            setOrderValue("order_quantity", value);
          }}
          side={props.side}
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
          onClick={() => {
            onSubmit();
          }}
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
        />

        <Divider className="oui-w-full" />
        {/* TP SL switch and content */}
        <OrderTPSL
          // onCancelTPSL={props.cancelTP_SL}
          // onEnableTP_SL={props.enableTP_SL}
          quote_dp={props.symbolInfo.quote_dp}
          switchState={props.tpslSwitch}
          onSwitchChanged={props.setTpslSwitch}
          orderType={formattedOrder.order_type!}
          errors={validated ? errors : null}
          isReduceOnly={formattedOrder.reduce_only}
          values={{
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
          onChange={(key, value) => {
            props.setOrderValue(key, value);
          }}
        />
        {/* reduce only switch and label */}
        <Flex
          justify={"between"}
          itemAlign={"center"}
          className="!oui-mt-0 xl:!oui-mt-3"
        >
          <Flex itemAlign={"center"} gapX={1}>
            <Switch
              data-testid="oui-testid-orderEntry-reduceOnly-switch"
              className="oui-h-[14px]"
              id={"reduceOnly"}
              checked={props.formattedOrder.reduce_only}
              onCheckedChange={(checked) => {
                props.setOrderValue("reduce_only", checked);
                // if (checked) {
                //   props.setOrderValue("order_type_ext", "");
                // }
              }}
            />
            <label htmlFor={"reduceOnly"} className={"oui-text-xs"}>
              {t("orderEntry.reduceOnly")}
            </label>
          </Flex>
          {/* Additional info （fok，ioc、post only， order confirm hidden） */}
          {!pinned && (
            <AdditionalConfigButton
              pinned={pinned}
              setPinned={setPinned}
              needConfirm={needConfirm}
              setNeedConfirm={setNeedConfirm}
              onValueChange={setOrderValue}
              orderTypeExtra={formattedOrder["order_type_ext"]}
              showExtra={
                formattedOrder["order_type"] === OrderType.LIMIT &&
                !props.tpslSwitch
              }
              hidden={hidden}
              setHidden={setHidden}
            />
          )}
        </Flex>
        {/* Additional info （fok，ioc、post only， order confirm hidden） */}
        {pinned && (
          <Box p={2} r={"md"} intensity={700} position={"relative"}>
            <AdditionalInfoWidget
              pinned={pinned}
              setPinned={setPinned}
              needConfirm={needConfirm}
              setNeedConfirm={setNeedConfirm}
              onValueChange={setOrderValue}
              orderTypeExtra={formattedOrder["order_type_ext"]}
              showExtra={
                formattedOrder["order_type"] === OrderType.LIMIT &&
                !props.tpslSwitch
              }
              hidden={hidden}
              setHidden={setHidden}
            />
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
    </OrderEntryProvider>
  );
};

//------------------- pin button start -------------------
const defaultPath =
  "M10.007 1.302a.74.74 0 0 0-.486.214c-1.033.989-1.349 1.815-.972 2.948-.88.675-1.437.84-2.536.84-1.503 0-2.484.182-3.152.85v.02a1.583 1.583 0 0 0 0 2.248l1.867 1.882-3.181 3.18c-.26.26-.28.696-.02.956.261.26.699.26.959 0l3.193-3.194 1.87 1.861a1.585 1.585 0 0 0 2.25 0h.02c.668-.667.854-1.523.854-3.144 0-1.03.212-1.758.852-2.523 1.233.361 1.95.015 2.961-.995a.68.68 0 0 0 .188-.48c0-.234-.06-.593-.209-1.04a5.34 5.34 0 0 0-1.312-2.103 5.35 5.35 0 0 0-2.104-1.312c-.448-.15-.808-.208-1.042-.208";

const PinButton = (props: HTMLAttributes<HTMLButtonElement>) => {
  const [path, setPath] = useState(defaultPath);
  return (
    <button {...props}>
      <svg
        width={16}
        height={16}
        viewBox="0 0 16 16"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => {
          setPath(
            'M10.008 1.302a.74.74 0 0 0-.486.214c-1.033.989-1.349 1.815-.972 2.948-.88.675-1.437.84-2.536.84-1.503 0-2.484.182-3.152.85v.02a1.583 1.583 0 0 0 0 2.248l1.867 1.882-3.181 3.18c-.26.26-.28.696-.02.956.261.26.699.26.959 0l3.193-3.194 1.87 1.861a1.585 1.585 0 0 0 2.25 0h.02c.668-.667.854-1.523.854-3.144 0-1.03.212-1.758.853-2.523 1.232.361 1.95.015 2.96-.995a.68.68 0 0 0 .188-.48c0-.234-.06-.593-.209-1.04a5.34 5.34 0 0 0-1.312-2.103A5.35 5.35 0 0 0 11.05 1.51c-.448-.15-.808-.208-1.042-.208m.258 1.37c.708.131 1.421.6 1.93 1.107.507.508.94 1.13 1.119 1.945-.636.61-1.026.658-1.662.323a.67.67 0 0 0-.779.117c-1.214 1.213-1.533 2.314-1.533 3.8 0 1.292-.076 1.773-.48 2.206-.113.123-.27.104-.374 0L3.799 7.486a.24.24 0 0 1-.017-.34c.239-.29.769-.515 2.226-.514 1.742.001 2.668-.448 3.812-1.52a.67.67 0 0 0 .125-.77c-.343-.686-.29-1.047.321-1.67"',
          );
        }}
        onMouseLeave={() => {
          setPath(defaultPath);
        }}
        className="oui-text-primary-darken "
      >
        <path d={path} />
      </svg>
    </button>
  );
};

//----------------- Order Quantity Input Component start -----------------
const OrderQuantityInput = (props: {
  type: OrderType;
  symbolInfo: API.SymbolExt;
  values: {
    order_quantity?: string;
    price?: string;
    trigger_price?: string;
    total?: string;
    side?: OrderSide;
    level?: OrderLevel;
    order_type_ext?: OrderType;
  };
  onChange: (
    key:
      | "order_quantity"
      | "order_price"
      | "trigger_price"
      | "total"
      | "order_type"
      | "order_type_ext"
      | "level",
    value: any,
  ) => void;
  onValuesChange: (value: any) => void;
  refs: Refs;
  onFocus: (type: InputType) => FocusEventHandler;
  onBlur: (type: InputType) => FocusEventHandler;
  bbo: Pick<
    OrderEntryScriptReturn,
    "bboStatus" | "bboType" | "onBBOChange" | "toggleBBO"
  >;
  priceInputContainerWidth?: number;
  parseErrorMsg: (key: keyof OrderValidationResult) => string;
  fillMiddleValue: OrderEntryScriptReturn["fillMiddleValue"];
}) => {
  const {
    type,
    symbolInfo,
    values,
    onFocus,
    onBlur,
    bbo,
    parseErrorMsg,
    fillMiddleValue,
  } = props;
  const { t } = useTranslation();

  const readOnly = bbo.bboStatus === BBOStatus.ON;

  const priceSuffix =
    type === OrderType.LIMIT ? (
      <Flex direction="column" itemAlign="end" className="oui-text-2xs">
        {symbolInfo.quote}
        <Flex justify={"end"} itemAlign="center" gap={2}>
          <Flex
            px={3}
            height={20}
            justify="center"
            itemAlign="center"
            r="base"
            className={cn(
              "oui-mt-[2px] oui-cursor-pointer oui-select-none oui-border",
              bbo.bboStatus === BBOStatus.ON
                ? "oui-border-primary"
                : "oui-border-line-12",
              bbo.bboStatus === BBOStatus.DISABLED && "oui-cursor-not-allowed",
            )}
            onClick={() => {
              if (bbo.bboStatus === BBOStatus.DISABLED) {
                modal.dialog({
                  title: t("common.tips"),
                  size: "xs",
                  content: (
                    <Text intensity={54}>
                      {t("orderEntry.bbo.disabled.tips")}
                    </Text>
                  ),
                });
              } else {
                bbo.toggleBBO();
              }
            }}
          >
            <Text
              className={cn(
                bbo.bboStatus === BBOStatus.ON && "oui-text-primary",
                bbo.bboStatus === BBOStatus.OFF && "oui-text-base-contrast-54",
                bbo.bboStatus === BBOStatus.DISABLED &&
                  "oui-text-base-contrast-20",
              )}
            >
              {t("orderEntry.bbo")}
            </Text>
          </Flex>
          <Text
            className={cn(
              "oui-select-none",
              "oui-cursor-pointer oui-text-primary",
            )}
            onClick={fillMiddleValue}
          >
            Mid
          </Text>
        </Flex>
      </Flex>
    ) : (
      symbolInfo.quote
    );

  return (
    <div className={"oui-space-y-1"}>
      {type === OrderType.STOP_LIMIT || type === OrderType.STOP_MARKET ? (
        <div className={"oui-group"}>
          <CustomInput
            label={t("common.trigger")}
            suffix={symbolInfo.quote}
            error={parseErrorMsg("trigger_price")}
            id={"trigger"}
            ref={props.refs.triggerPriceInputRef}
            value={values.trigger_price}
            onChange={(e) => {
              props.onChange("trigger_price", e);
            }}
            formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
            onFocus={onFocus(InputType.TRIGGER_PRICE)}
            onBlur={onBlur(InputType.TRIGGER_PRICE)}
          />
        </div>
      ) : null}

      {type === OrderType.LIMIT || type === OrderType.STOP_LIMIT ? (
        <div
          ref={props.refs.priceInputContainerRef}
          className="oui-group oui-relative oui-w-full"
        >
          <CustomInput
            label={t("common.price")}
            suffix={priceSuffix}
            id={"price"}
            value={values.price}
            error={parseErrorMsg("order_price")}
            ref={props.refs.priceInputRef}
            // helperText="Price per unit"
            onChange={(e) => {
              props.onChange("order_price", e);
            }}
            formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
            onFocus={onFocus(InputType.PRICE)}
            onBlur={onBlur(InputType.PRICE)}
            readonly={readOnly}
            classNames={{
              root: cn(readOnly && "focus-within:oui-outline-transparent "),
              input: cn(readOnly && "oui-cursor-auto"),
            }}
          />
          {bbo.bboStatus === BBOStatus.ON && (
            <div className={cn("oui-absolute oui-bottom-1 oui-left-0")}>
              <BBOOrderTypeSelect
                value={bbo.bboType}
                onChange={bbo.onBBOChange}
                contentStyle={{
                  width: props.priceInputContainerWidth,
                }}
              />
            </div>
          )}
        </div>
      ) : null}

      <Grid cols={2} className={"oui-group oui-space-x-1"}>
        <CustomInput
          label={t("common.qty")}
          suffix={symbolInfo.base}
          id="order_quantity_input"
          name="order_quantity_input"
          className={"!oui-rounded-r"}
          value={values.order_quantity}
          error={parseErrorMsg("order_quantity")}
          onChange={(e) => {
            props.onChange("order_quantity", e);
          }}
          formatters={[inputFormatter.dpFormatter(symbolInfo.base_dp)]}
          onFocus={onFocus(InputType.QUANTITY)}
          onBlur={onBlur(InputType.QUANTITY)}
        />
        <CustomInput
          label={`${t("common.total")}≈`}
          suffix={symbolInfo.quote}
          id={"total"}
          className={"!oui-rounded-l"}
          value={values.total}
          error={parseErrorMsg("total")}
          onChange={(e) => {
            props.onChange("total", e);
          }}
          onFocus={onFocus(InputType.TOTAL)}
          onBlur={onBlur(InputType.TOTAL)}
          formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
        />
      </Grid>
    </div>
  );
};

// ----------- Custom Input Component start ------------
const CustomInput = forwardRef<
  HTMLInputElement,
  {
    label: string;
    suffix?: ReactNode;
    placeholder?: string;
    id: string;
    className?: string;
    name?: string;
    // onChange?: InputProps["onChange"];
    onChange?: (value: string) => void;
    value?: InputProps["value"];
    autoFocus?: InputProps["autoFocus"];
    error?: string;
    onFocus?: InputProps["onFocus"];
    onBlur?: InputProps["onBlur"];
    formatters?: InputProps["formatters"];
    overrideFormatters?: InputProps["formatters"];
    // helperText?: InputProps["helperText"];
    classNames?: InputProps["classNames"];
    readonly?: boolean;
  }
>((props, ref) => {
  const { placeholder = "0" } = props;
  const { errorMsgVisible } = useContext(OrderEntryContext);
  return (
    <Input.tooltip
      ref={ref}
      tooltip={errorMsgVisible ? props.error : undefined}
      autoComplete={"off"}
      autoFocus={props.autoFocus}
      size={"lg"}
      placeholder={props.readonly ? "" : placeholder}
      id={props.id}
      name={props.name}
      color={props.error ? "danger" : undefined}
      prefix={
        <InputLabel id={props.id} className={props.classNames?.prefix}>
          {props.label}
        </InputLabel>
      }
      suffix={props.suffix}
      value={props.readonly ? "" : props.value || ""}
      // onChange={props.onChange}
      onValueChange={props.onChange}
      onFocus={(event) => {
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        props.onBlur?.(event);
      }}
      formatters={
        props.overrideFormatters || [
          ...(props.formatters ?? []),
          inputFormatter.numberFormatter,
          inputFormatter.currencyFormatter,
          inputFormatter.decimalPointFormatter,
        ]
      }
      classNames={{
        root: cn(
          "orderly-order-entry oui-relative oui-h-[54px] oui-rounded oui-border oui-border-solid oui-border-line oui-px-2 oui-py-1 group-first:oui-rounded-t-xl group-last:oui-rounded-b-xl",
          props.className,
          props.classNames?.root,
        ),
        input: cn("oui-mb-1 oui-mt-5 oui-h-5", props?.classNames?.input),
        // prefix: cn(props.classNames?.prefix),
        suffix: cn(
          "oui-absolute oui-right-0 oui-top-0 oui-justify-start oui-py-2 oui-text-2xs oui-text-base-contrast-36",
          props.classNames?.suffix,
        ),
      }}
      readOnly={props.readonly}
    />
  );
});

CustomInput.displayName = "CustomInput";

const InputLabel = (
  props: PropsWithChildren<{ id: string; className?: string }>,
) => {
  return (
    <label
      htmlFor={props.id}
      className={cn(
        "oui-absolute oui-left-2 oui-top-[7px] oui-text-2xs oui-text-base-contrast-36",
        props.className,
      )}
    >
      {props.children}
    </label>
  );
};

// ----------- Custom Input Component end ------------

const QuantitySlider = (props: {
  canTrade: boolean;
  side: OrderSide;
  value: number;
  maxQty: number;
  currentQtyPercentage: number;
  tick: number;
  dp: number;
  setMaxQty: () => void;
  onValueChange: (value: number) => void;
}) => {
  const { canTrade } = props;
  const { t } = useTranslation();

  const color = useMemo(
    () =>
      canTrade ? (props.side === OrderSide.BUY ? "buy" : "sell") : undefined,
    [props.side, canTrade],
  );

  const maxLabel = useMemo(() => {
    return props.side === OrderSide.BUY
      ? t("orderEntry.maxBuy")
      : t("orderEntry.maxSell");
  }, [props.side, t]);

  return (
    <div>
      <Slider.single
        disabled={props.maxQty === 0 || !canTrade}
        value={props.value}
        color={color}
        markCount={4}
        showTip
        max={props.maxQty}
        step={props.tick}
        onValueChange={props.onValueChange}
      />
      <Flex justify={"between"} className="oui-pt-1 xl:oui-pt-2">
        <Text.numeral
          rule={"percentages"}
          size={"2xs"}
          color={color}
          dp={2}
          padding={false}
        >
          {canTrade ? props.currentQtyPercentage : 0}
        </Text.numeral>
        <Flex>
          <button
            className={textVariants({
              size: "2xs",
              className: "oui-mr-1",
            })}
            onClick={() => props.setMaxQty()}
            data-testid="oui-testid-orderEntry-maxQty-value-button"
          >
            {maxLabel}
          </button>
          <Text.numeral
            size={"2xs"}
            color={color}
            dp={props.dp}
            padding={false}
            data-testid="oui-testid-orderEntry-maxQty-value"
          >
            {canTrade ? props.maxQty : 0}
          </Text.numeral>
        </Flex>
      </Flex>
    </div>
  );
};

// -----------Order type Select Component start ------------

const OrderTypeSelect = (props: {
  type: OrderType;
  onChange: (type: OrderType) => void;
  side: OrderSide;
  canTrade: boolean;
}) => {
  const { t } = useTranslation();

  const options = useMemo(() => {
    return [
      { label: t("orderEntry.orderType.limitOrder"), value: OrderType.LIMIT },
      { label: t("orderEntry.orderType.marketOrder"), value: OrderType.MARKET },
      {
        label: t("orderEntry.orderType.stopLimit"),
        value: OrderType.STOP_LIMIT,
      },
      {
        label: t("orderEntry.orderType.stopMarket"),
        value: OrderType.STOP_MARKET,
      },
      {
        label: t("orderEntry.orderType.scaledOrder"),
        value: OrderType.SCALED,
      },
    ];
  }, [t]);

  const displayLabelMap = useMemo(() => {
    return {
      [OrderType.LIMIT]: t("orderEntry.orderType.limit"),
      [OrderType.MARKET]: t("common.marketPrice"),
      [OrderType.STOP_LIMIT]: t("orderEntry.orderType.stopLimit"),
      [OrderType.STOP_MARKET]: t("orderEntry.orderType.stopMarket"),
      [OrderType.SCALED]: t("orderEntry.orderType.scaledOrder"),
    };
  }, [t]);

  return (
    <Select.options
      testid="oui-testid-orderEntry-orderType-button"
      currentValue={props.type}
      value={props.type}
      options={options}
      onValueChange={props.onChange}
      contentProps={{
        className: "oui-bg-base-8 oui-w-full",
      }}
      valueFormatter={(value, option) => {
        const item = options.find((o) => o.value === value);
        if (!item) {
          return <Text size={"xs"}>{option.placeholder}</Text>;
        }

        const label = displayLabelMap[value as keyof typeof displayLabelMap];

        return (
          <Text
            size={"xs"}
            color={
              props.canTrade
                ? props.side === OrderSide.BUY
                  ? "buy"
                  : "sell"
                : undefined
            }
          >
            {label}
          </Text>
        );
      }}
      size={"md"}
    />
  );
};

// -----------Order type Select Component end ------------

function AssetInfo(props: {
  canTrade: boolean;
  quote: string;
  estLiqPrice: number | null;
  estLeverage: number | null;
  currentLeverage: number | null;
  slippage: string;
  dp: number;
  estSlippage: number | null;
  setSlippage: (slippage: string) => void;
  orderType: OrderType;
  disableFeatures?: ("slippageSetting" | "feesInfo")[];
}) {
  const { canTrade } = props;
  const { t } = useTranslation();

  return (
    <div className={"oui-space-y-[2px] xl:oui-space-y-1"}>
      <Flex justify={"between"}>
        <Text size={"2xs"}>{t("orderEntry.estLiqPrice")}</Text>
        <Text.numeral
          unit={props.quote}
          size={"2xs"}
          dp={props.dp}
          className={"oui-text-base-contrast-80"}
          unitClassName={"oui-ml-1 oui-text-base-contrast-36"}
        >
          {canTrade ? (props.estLiqPrice ?? "--") : "--"}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"}>
        <Text size={"2xs"}>{t("leverage.accountLeverage")}</Text>
        <Flex
          gapX={1}
          className={textVariants({
            size: "2xs",
            intensity: 80,
          })}
        >
          <Text.numeral unit={canTrade ? "x" : undefined}>
            {canTrade ? (props.currentLeverage ?? "--") : "--"}
          </Text.numeral>
          {props.estLeverage && (
            <>
              <svg
                width="10"
                height="10"
                viewBox="0 0 10 10"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.505 4.997c0-.23.186-.416.416-.416H6.07L4.833 3.332l.586-.585 1.964 1.95a.42.42 0 0 1 .122.3.42.42 0 0 1-.122.3l-1.964 1.95-.586-.585L6.07 5.413H2.921a.416.416 0 0 1-.416-.416"
                  fill="#fff"
                  fillOpacity=".54"
                />
              </svg>

              <span>{`${props.estLeverage}x`}</span>
            </>
          )}
        </Flex>
        {/* <Text.numeral unit={"x"} size={"2xs"}>
          {props.estLeverage ?? "--"}
        </Text.numeral> */}
      </Flex>
      {props.orderType === OrderType.MARKET &&
        !props.disableFeatures?.includes("slippageSetting") && (
          <SlippageUI
            slippage={props.slippage}
            setSlippage={props.setSlippage}
            estSlippage={props.estSlippage}
          />
        )}

      {!props.disableFeatures?.includes("feesInfo") && <FeesWidget />}
    </div>
  );
}

function AdditionalConfigButton(props: {
  pinned: boolean;
  setPinned: (pinned: boolean) => void;
  onValueChange?: (key: keyof OrderlyOrder, value: any) => void;
  orderTypeExtra?: OrderType;
  needConfirm: boolean;
  setNeedConfirm: (value: boolean) => void;
  showExtra: boolean;
  hidden: boolean;
  setHidden: (hidden: boolean) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          data-testid="oui-testid-orderEntry-additional-button"
          onClick={() => {
            setOpen(true);
          }}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="currentColor"
            xmlns="http://www.w3.org/2000/svg"
            className="oui-fill-white/[.36] hover:oui-fill-white/80"
          >
            <path
              d="M3.332 2.665a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V3.332a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V3.332a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V3.332a.667.667 0 0 0-.667-.667zm-8 4a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V7.332a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V7.332a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V7.332a.667.667 0 0 0-.667-.667zm-8 4a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667v-1.333a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667v-1.333a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667v-1.333a.667.667 0 0 0-.667-.667z"
              // fill="#fff"
              // fillOpacity={open ? 0.8 : 0.36}
            />
          </svg>
        </button>
      </PopoverTrigger>
      <PopoverContent side={"top"} align={"end"} className={"oui-w-[230px]"}>
        <AdditionalInfoWidget {...props} />
      </PopoverContent>
    </PopoverRoot>
  );
}

// -----------BBO Select Component start ------------

const BBOOrderTypeSelect = (props: {
  value?: BBOOrderType;
  onChange: (value: BBOOrderType) => void;
  contentStyle?: CSSProperties;
}) => {
  const { t } = useTranslation();

  const options = [
    {
      label: t("orderEntry.bbo.counterparty1"),
      value: BBOOrderType.COUNTERPARTY1,
    },
    {
      label: t("orderEntry.bbo.counterparty5"),
      value: BBOOrderType.COUNTERPARTY5,
    },
    {
      label: t("orderEntry.bbo.queue1"),
      value: BBOOrderType.QUEUE1,
    },
    {
      label: t("orderEntry.bbo.queue5"),
      value: BBOOrderType.QUEUE5,
    },
  ];

  return (
    <Select.options
      testid="oui-testid-orderEntry-bbo-orderType-button"
      currentValue={props.value}
      value={props.value}
      options={options}
      onValueChange={props.onChange}
      contentProps={{
        className: "oui-bg-base-8 oui-w-full",
        style: props.contentStyle,
      }}
      size={"sm"}
      classNames={{
        trigger: "oui-border-none oui-bg-transparent",
      }}
      valueFormatter={(value, option) => {
        const item = options.find((item) => item.value === value);

        return (
          <Box>
            <Text size="sm">{item?.label}</Text>
          </Box>
        );
      }}
    />
  );
};

// -----------BBO type Select Component end ------------

const ScaledOrderInput = (props: {
  type: OrderType;
  symbolInfo: API.SymbolExt;
  values: {
    order_quantity?: string;
    total?: string;
    side?: OrderSide;
    end_price?: string;
    start_price?: string;
    total_orders?: string;
    distribution_type?: DistributionType;
    skew?: string;
  };
  onChange: (
    key:
      | "order_quantity"
      | "total"
      | "order_type"
      | "start_price"
      | "end_price"
      | "total_orders"
      | "distribution_type"
      | "skew",
    value: any,
  ) => void;
  onValuesChange: (value: any) => void;
  onFocus: (type: InputType) => FocusEventHandler;
  onBlur: (type: InputType, tick?: number) => FocusEventHandler;
  parseErrorMsg: (
    key: keyof OrderValidationResult,
    customValue?: string,
  ) => string;
  quantityUnit: "quote" | "base";
  setQuantityUnit: (unit: "quote" | "base") => void;
  errors: OrderValidationResult | null;
}) => {
  const {
    symbolInfo,
    values,
    onFocus,
    onBlur,
    parseErrorMsg,
    quantityUnit,
    setQuantityUnit,
    errors,
  } = props;
  const { base, quote, base_dp, quote_dp } = symbolInfo;
  const { t } = useTranslation();

  const isBase = quantityUnit === "base";
  const unit = isBase ? base : quote;
  const showSkewInput = values.distribution_type === DistributionType.CUSTOM;

  const suffix = (
    <QuantityUnit
      base={base}
      quote={quote}
      value={unit}
      onValueChange={(value) => {
        setQuantityUnit(value === base ? "base" : "quote");
      }}
    />
  );

  return (
    <div className="oui-space-y-1">
      <CustomInput
        label={t("orderEntry.startPrice")}
        suffix={quote}
        id="order_start_price_input"
        value={values.start_price}
        error={parseErrorMsg("start_price")}
        onChange={(e) => {
          props.onChange("start_price", e);
        }}
        formatters={[inputFormatter.dpFormatter(quote_dp)]}
        onFocus={onFocus(InputType.START_PRICE)}
        onBlur={onBlur(InputType.START_PRICE)}
        classNames={{
          root: "oui-rounded-t-xl",
        }}
      />
      <CustomInput
        label={t("orderEntry.endPrice")}
        suffix={quote}
        id="order_end_price_input"
        value={values.end_price}
        error={parseErrorMsg("end_price")}
        onChange={(val) => {
          props.onChange("end_price", val);
        }}
        formatters={[inputFormatter.dpFormatter(quote_dp)]}
        onFocus={onFocus(InputType.END_PRICE)}
        onBlur={onBlur(InputType.END_PRICE)}
      />

      <Grid cols={2} className={"oui-group oui-space-x-1"}>
        {isBase ? (
          <CustomInput
            label={t("common.qty")}
            suffix={suffix}
            id="order_quantity_input"
            name="order_quantity_input"
            className="!oui-rounded-r"
            value={values.order_quantity}
            error={parseErrorMsg(
              "order_quantity",
              `${errors?.order_quantity?.value} ${base}`,
            )}
            onChange={(val) => {
              props.onChange("order_quantity", val);
            }}
            formatters={[inputFormatter.dpFormatter(base_dp)]}
            onFocus={onFocus(InputType.QUANTITY)}
            onBlur={onBlur(InputType.QUANTITY)}
          />
        ) : (
          <CustomInput
            label={t("common.qty")}
            suffix={suffix}
            id="order_total_input"
            name="order_total_input"
            className="!oui-rounded-r"
            value={values.total}
            error={parseErrorMsg(
              "order_quantity",
              `${errors?.total?.value} ${quote}`,
            )}
            onChange={(val) => {
              props.onChange("total", val);
            }}
            formatters={[inputFormatter.dpFormatter(quote_dp)]}
            onFocus={onFocus(InputType.TOTAL)}
            onBlur={onBlur(InputType.TOTAL)}
          />
        )}
        <CustomInput
          label={t("orderEntry.totalOrders")}
          placeholder="2-20"
          id="order_total_orders_input"
          className={"!oui-rounded-l"}
          value={values.total_orders}
          error={parseErrorMsg("total_orders")}
          onChange={(val) => {
            props.onChange("total_orders", val);
          }}
          overrideFormatters={[
            // inputFormatter.rangeFormatter({ min: 2, max: 20 }),
            inputFormatter.numberFormatter,
            inputFormatter.dpFormatter(0),
          ]}
          onFocus={onFocus(InputType.TOTAL_ORDERS)}
          onBlur={onBlur(InputType.TOTAL_ORDERS)}
        />
      </Grid>
      <QuantityDistributionInput
        value={values.distribution_type}
        onValueChange={(value) => {
          props.onChange("distribution_type", value);
        }}
        className={cn(!showSkewInput && "oui-rounded-b-xl")}
      />

      {showSkewInput && (
        <CustomInput
          id="order_skew_input"
          label={t("orderEntry.skew")}
          value={values.skew}
          error={parseErrorMsg("skew")}
          onChange={(val) => {
            props.onChange("skew", val);
          }}
          onFocus={onFocus(InputType.SKEW)}
          onBlur={onBlur(InputType.SKEW)}
          overrideFormatters={[
            inputFormatter.rangeFormatter({ min: 0, max: 100, dp: 2 }),
            inputFormatter.dpFormatter(2),
          ]}
          classNames={{
            root: "oui-rounded-b-xl",
          }}
        />
      )}
    </div>
  );
};
