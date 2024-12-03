import { type uesOrderEntryScriptReturn } from "./useOrderEntry.script";
import { AuthGuard } from "@orderly.network/ui-connector";
import {
  Box,
  Button,
  cn,
  Divider,
  Flex,
  Grid,
  Input,
  inputFormatter,
  InputProps,
  modal,
  PopoverContent,
  PopoverRoot,
  PopoverTrigger,
  Select,
  SelectItem,
  Slider,
  Switch,
  Text,
  textVariants,
  ThrottledButton,
  toast,
} from "@orderly.network/ui";
import {
  FocusEventHandler,
  forwardRef,
  HTMLAttributes,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  API,
  OrderlyOrder,
  OrderSide,
  OrderType,
} from "@orderly.network/types";
import { OrderTPSL } from "./components/tpsl";

import { orderConfirmDialogId } from "./components/dialog/confirm.ui";
import {
  OrderEntryContext,
  OrderEntryProvider,
} from "./components/orderEntryContext";
import { useLocalStorage } from "@orderly.network/hooks";
import { AdditionalInfoWidget } from "./components/additional/additionnalInfo.widget";
import { InputType } from "./types";
import { SDKError } from "@orderly.network/types";
import { ApiError } from "@orderly.network/types";

type Refs = uesOrderEntryScriptReturn["refs"];

export const OrderEntry = (
  props: uesOrderEntryScriptReturn & {
    containerRef: any;
  }
) => {
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
    refs,
  } = props;

  // console.log("props", props);

  const { errors, validated } = metaState;
  const [errorMsgVisible, setErrorMsgVisible] = useState(false);
  const [needConfirm, setNeedConfirm] = useLocalStorage(
    "orderly_order_confirm",
    true
  );
  const [pinned, setPinned] = useLocalStorage(
    "orderly-order-additional-pinned",
    true
  );
  const [hidden, setHidden] = useLocalStorage("orderly-order-hidden", false);

  const buttonLabel = useMemo(() => {
    return side === OrderSide.BUY ? "Buy / Long" : "Sell / Short";
  }, [side]);

  useEffect(() => {
    if (validated) {
      setErrorMsgVisible(true);
    }
  }, [validated]);

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
    helper
      .validate()
      .then(
        (order: any) => {
          if (needConfirm) {
            return modal.show(orderConfirmDialogId, {
              order: formattedOrder,

              quote: symbolInfo.quote,
              base: symbolInfo.base,

              quoteDP: symbolInfo.quote_dp,
              baseDP: symbolInfo.base_dp,
            });
          }

          return true;
        },
        (errors) => {
          setErrorMsgVisible(true);
        }
      )
      .then(() => {
        return submit().then((result: any) => {
          console.log(result);
          if (result.success) {
            // setOrderValue("order_quantity", "");
          } else {
            toast.error(result.message);
          }
        });
      })
      .catch((error) => {
        console.log("catch:", error);
        if (error === "cancel") return;
        toast.error(error.message);
        // toast.error(`Error:${error.message}`);

        // if (error instanceof ApiError) {
        // toast.error(error.message);
        // }
      });
  };

  return (
    <OrderEntryProvider
      value={{
        errorMsgVisible,
      }}
    >
      <div
        className={"oui-space-y-2 xl:oui-space-y-3 oui-text-base-contrast-54"}
        ref={props.containerRef}
      >
        {/* Buy Sell button */}
        <Flex gapX={2} className="oui-flex-col lg:oui-flex-row oui-gap-y-3">
          <div
            className={
              "oui-grid oui-grid-cols-2 oui-w-full oui-flex-1 oui-gap-x-2 lg:oui-flex lg:oui-gap-x-[6px]"
            }
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
                  ? "oui-bg-success-darken hover:oui-bg-success active:oui-bg-success"
                  : "oui-bg-base-7 hover:oui-bg-base-6 active:oui-bg-base-6 oui-text-base-contrast-36"
              )}
            >
              Buy
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
                  ? "oui-bg-danger-darken hover:oui-bg-danger active:oui-bg-danger"
                  : "oui-bg-base-7 hover:oui-bg-base-6 active:oui-bg-base-6 oui-text-base-contrast-36"
              )}
            >
              Sell
            </Button>
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
        <Flex justify={"between"}>
          <Text size={"2xs"}>Available</Text>
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
        {/* Inputs (price,quantity,triggerPrice) */}
        <OrderQuantityInput
          type={props.type}
          symbolInfo={symbolInfo}
          values={{
            quantity: formattedOrder.order_quantity,
            price: formattedOrder.order_price,
            trigger_price: formattedOrder.trigger_price,
            total: formattedOrder.total,
          }}
          errors={validated ? errors : null}
          onChange={(key, value) => {
            props.setOrderValue(key, value);
          }}
          refs={props.refs}
          onBlur={props.onBlur}
          onFocus={props.onFocus}
        />
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
        <AuthGuard buttonProps={{ fullWidth: true }}>
          <ThrottledButton
            fullWidth
            id={"order-entry-submit-button"}
            // color={side === OrderSide.BUY ? "buy" : "sell"}
            data-type={OrderSide.BUY}
            className={cn(
              side === OrderSide.BUY
                ? "orderly-order-entry-submit-button-buy oui-bg-success-darken hover:oui-bg-success active:oui-bg-success"
                : "orderly-order-entry-submit-button-sell oui-bg-danger-darken hover:oui-bg-danger active:oui-bg-danger"
            )}
            onClick={() => {
              onSubmit();
            }}
            loading={props.isMutating}
          >
            {buttonLabel}
          </ThrottledButton>
        </AuthGuard>
        {/* Asset info */}
        <AssetInfo
          canTrade={props.canTrade}
          quote={symbolInfo.quote}
          estLiqPrice={props.estLiqPrice}
          estLeverage={props.estLeverage}
          currentLeverage={props.currentLeverage}
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
          className="!oui-mt-[0px] xl:!oui-mt-3"
        >
          <Flex itemAlign={"center"} gapX={1}>
            <Switch
              className="oui-h-[14px]"
              id={"reduceOnly"}
              checked={props.formattedOrder.reduce_only}
              onCheckedChange={(checked) => {
                props.setOrderValue("reduce_only", checked);
                if (checked) {
                  props.setOrderValue("order_type_ext", "");
                }
              }}
            />
            <label htmlFor={"reduceOnly"} className={"oui-text-xs"}>
              Reduce only
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
              className={"oui-absolute oui-top-2 oui-right-2 oui-group"}
            ></PinButton>
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
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        onMouseEnter={() => {
          setPath(
            'M10.008 1.302a.74.74 0 0 0-.486.214c-1.033.989-1.349 1.815-.972 2.948-.88.675-1.437.84-2.536.84-1.503 0-2.484.182-3.152.85v.02a1.583 1.583 0 0 0 0 2.248l1.867 1.882-3.181 3.18c-.26.26-.28.696-.02.956.261.26.699.26.959 0l3.193-3.194 1.87 1.861a1.585 1.585 0 0 0 2.25 0h.02c.668-.667.854-1.523.854-3.144 0-1.03.212-1.758.853-2.523 1.232.361 1.95.015 2.96-.995a.68.68 0 0 0 .188-.48c0-.234-.06-.593-.209-1.04a5.34 5.34 0 0 0-1.312-2.103A5.35 5.35 0 0 0 11.05 1.51c-.448-.15-.808-.208-1.042-.208m.258 1.37c.708.131 1.421.6 1.93 1.107.507.508.94 1.13 1.119 1.945-.636.61-1.026.658-1.662.323a.67.67 0 0 0-.779.117c-1.214 1.213-1.533 2.314-1.533 3.8 0 1.292-.076 1.773-.48 2.206-.113.123-.27.104-.374 0L3.799 7.486a.24.24 0 0 1-.017-.34c.239-.29.769-.515 2.226-.514 1.742.001 2.668-.448 3.812-1.52a.67.67 0 0 0 .125-.77c-.343-.686-.29-1.047.321-1.67"'
          );
        }}
        onMouseLeave={() => {
          setPath(defaultPath);
        }}
      >
        <path d={path} fill="#608CFF" />
      </svg>
    </button>
  );
};

//----------------- Order Quantity Input Component start -----------------
const OrderQuantityInput = (props: {
  type: OrderType;
  symbolInfo: API.SymbolExt;
  errors: any;
  values: {
    quantity?: string;
    price?: string;
    trigger_price?: string;
    total?: string;
  };
  onChange: (
    key: "order_quantity" | "order_price" | "trigger_price" | "total",
    value: any
  ) => void;
  refs: Refs;
  onFocus: (type: InputType) => FocusEventHandler;
  onBlur: (type: InputType) => FocusEventHandler;
}) => {
  const { type, symbolInfo, errors, values, onFocus, onBlur } = props;

  const parseErrorMsg = (key: string) => {
    if (errors && errors[key]) {
      return errors[key].message;
    }
    return "";
  };
  return (
    <div className={"oui-space-y-1"}>
      {type === OrderType.STOP_LIMIT || type === OrderType.STOP_MARKET ? (
        <div className={"oui-group"}>
          <CustomInput
            label={"Trigger"}
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
        <div className={"oui-group"}>
          <CustomInput
            label={"Price"}
            suffix={symbolInfo.quote}
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
          />
        </div>
      ) : null}

      <Grid cols={2} className={"oui-space-x-1 oui-group"}>
        <CustomInput
          label={"Qty"}
          suffix={symbolInfo.base}
          id="order_quantity_input"
          name="order_quantity_input"
          className={"!oui-rounded-br !oui-rounded-tr"}
          value={values.quantity}
          error={parseErrorMsg("order_quantity")}
          onChange={(e) => {
            props.onChange("order_quantity", e);
          }}
          formatters={[inputFormatter.dpFormatter(symbolInfo.base_dp)]}
          onFocus={onFocus(InputType.QUANTITY)}
          onBlur={onBlur(InputType.QUANTITY)}
        />
        <CustomInput
          label={"Total≈"}
          suffix={symbolInfo.quote}
          id={"total"}
          className={"!oui-rounded-bl !oui-rounded-tl"}
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
    suffix: string;
    id: string;
    className?: string;
    name?: string;
    // onChange?: InputProps["onChange"];
    onChange?: (value: string) => void;
    value?: InputProps["value"];
    autoFocus?: InputProps["autoFocus"];
    error?: string;
    onFocus: InputProps["onFocus"];
    onBlur: InputProps["onBlur"];
    formatters?: InputProps["formatters"];
    // helperText?: InputProps["helperText"];
  }
>((props, ref) => {
  const { errorMsgVisible } = useContext(OrderEntryContext);
  const [placeholder, setPlaceholder] = useState<string>("0");
  return (
    <Input.tooltip
      ref={ref}
      tooltip={errorMsgVisible ? props.error : undefined}
      autoComplete={"off"}
      autoFocus={props.autoFocus}
      size={"lg"}
      placeholder={placeholder}
      id={props.id}
      name={props.name}
      color={props.error ? "danger" : undefined}
      prefix={<InputLabel id={props.id}>{props.label}</InputLabel>}
      suffix={props.suffix}
      value={props.value || ""}
      // onChange={props.onChange}
      onValueChange={props.onChange}
      onFocus={(event) => {
        setPlaceholder("");
        props.onFocus?.(event);
      }}
      onBlur={(event) => {
        setPlaceholder("0");
        props.onBlur?.(event);
      }}
      formatters={[
        ...(props.formatters ?? []),
        inputFormatter.numberFormatter,
        inputFormatter.currencyFormatter,
      ]}
      classNames={{
        root: cn(
          "orderly-order-entry oui-relative oui-pt-8 oui-h-[54px] oui-px-2 oui-py-1 oui-pr-2 oui-border oui-border-solid oui-border-line oui-rounded group-first:oui-rounded-t-xl group-last:oui-rounded-b-xl",
          props.className
        ),
        input: "oui-mt-5 oui-mb-1 oui-h-5",
        prefix:
          "oui-absolute oui-left-2 oui-top-[7px] oui-text-base-contrast-36",
        suffix:
          "oui-absolute oui-right-0 oui-top-0 oui-text-base-contrast-36 oui-text-2xs oui-justify-start oui-py-2",
      }}
    />
  );
});

CustomInput.displayName = "CustomInput";

const InputLabel = (props: PropsWithChildren<{ id: string }>) => {
  return (
    <label
      htmlFor={props.id}
      className={
        "oui-absolute oui-left-2 oui-top-[7px] oui-text-base-contrast-36 oui-text-2xs"
      }
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
  const color = useMemo(
    () =>
      canTrade ? (props.side === OrderSide.BUY ? "buy" : "sell") : undefined,
    [props.side, canTrade]
  );

  const maxLabel = useMemo(() => {
    return props.side === OrderSide.BUY ? "Max buy" : "Max sell";
  }, [props.side]);

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
          >
            {maxLabel}
          </button>
          <Text.numeral
            size={"2xs"}
            color={color}
            dp={props.dp}
            padding={false}
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
  const options = [
    { label: "Limit order", value: OrderType.LIMIT },
    { label: "Market order", value: OrderType.MARKET },
    { label: "Stop limit", value: OrderType.STOP_LIMIT },
    { label: "Stop market", value: OrderType.STOP_MARKET },
  ];
  return (
    <Select.options
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
            {item?.label.replace(" order", "")}
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
}) {
  const { canTrade } = props;
  return (
    <div className={"oui-space-y-[2px] xl:oui-space-y-1"}>
      <Flex justify={"between"}>
        <Text size={"2xs"}>Est. Liq. price</Text>
        <Text.numeral
          unit={props.quote}
          size={"2xs"}
          className={"oui-text-base-contrast-80"}
          unitClassName={"oui-ml-1 oui-text-base-contrast-36"}
        >
          {canTrade ? props.estLiqPrice ?? "--" : "--"}
        </Text.numeral>
      </Flex>
      <Flex justify={"between"}>
        <Text size={"2xs"}>Account leverage</Text>
        <Flex
          gapX={1}
          className={textVariants({
            size: "2xs",
            intensity: 80,
          })}
        >
          <Text.numeral unit={canTrade ? "x" : undefined}>
            {canTrade ? props.currentLeverage ?? "--" : "--"}
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
  // const []
  const [open, setOpen] = useState(false);

  return (
    <PopoverRoot open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
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
