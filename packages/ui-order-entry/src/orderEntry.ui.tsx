import { type uesOrderEntryScriptReturn } from "./useOrderEntry.script";
import { AuthGuard } from "@orderly.network/ui-connector";
import {
  Box,
  Button,
  cn,
  Divider,
  Flex,
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
} from "@orderly.network/ui";
import {
  FocusEventHandler,
  forwardRef,
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

type Refs = uesOrderEntryScriptReturn["refs"];

export const OrderEntry = (props: uesOrderEntryScriptReturn) => {
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
      if (target.closest("#order-entry-submit-button")) {
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

  const onSubmit = (): void => {
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
        return submit();
      })
      .catch((error) => {
        console.log("catch:", error);
      });
  };

  return (
    <OrderEntryProvider
      value={{
        errorMsgVisible,
      }}
    >
      <div className={"oui-space-y-3 oui-text-base-contrast-54"}>
        <Flex gapX={2} className="oui-flex-col lg:oui-flex-row oui-gap-y-2">
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
              color={side === OrderSide.BUY ? "buy" : "secondary"}
            >
              Buy
            </Button>
            <Button
              onClick={() => {
                props.setOrderValue("side", OrderSide.SELL);
              }}
              fullWidth
              size={"md"}
              color={side === OrderSide.SELL ? "sell" : "secondary"}
            >
              Sell
            </Button>
          </div>
          <div className={"oui-w-full lg:oui-flex-1"}>
            <OrderTypeSelect
              type={formattedOrder.order_type}
              onChange={(type) => {
                setOrderValue("order_type", type);
              }}
            />
          </div>
        </Flex>
        <Flex justify={"between"}>
          <Text size={"2xs"}>Available</Text>
          <Text.numeral
            unit={symbolInfo.quote}
            size={"2xs"}
            className={"oui-text-base-contrast-80"}
            unitClassName={"oui-ml-1 oui-text-base-contrast-54"}
          >
            {freeCollateral}
          </Text.numeral>
        </Flex>
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
        <QuantitySlider
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
        <AuthGuard buttonProps={{ fullWidth: true }}>
          <Button
            fullWidth
            id={"order-entry-submit-button"}
            color={side === OrderSide.BUY ? "buy" : "sell"}
            onClick={() => {
              onSubmit();
            }}
            loading={props.isMutating}
          >
            {buttonLabel}
          </Button>
        </AuthGuard>
        <AssetInfo
          quote={symbolInfo.quote}
          estLiqPrice={props.estLiqPrice}
          estLeverage={props.estLeverage}
          currentLeverage={props.currentLeverage}
        />
        <Divider />
        <OrderTPSL
          onCancelTPSL={props.cancelTP_SL}
          orderType={formattedOrder.order_type}
          errors={validated ? errors : null}
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
        <Flex justify={"between"} itemAlign={"center"}>
          <Flex itemAlign={"center"} gapX={1}>
            <Switch
              id={"reduceOnly"}
              checked={props.formattedOrder.reduce_only}
              onCheckedChange={(checked) => {
                // console.log(checked);
                props.setOrderValue("reduce_only", checked);
              }}
            />
            <label htmlFor={"reduceOnly"} className={"oui-text-xs"}>
              Reduce only
            </label>
          </Flex>
          {!pinned && (
            <AdditionalConfigButton
              pinned={pinned}
              setPinned={setPinned}
              needConfirm={needConfirm}
              setNeedConfirm={setNeedConfirm}
              onValueChange={setOrderValue}
              orderTypeExtra={formattedOrder["order_type_ext"]}
              showExtra={formattedOrder["order_type"] === OrderType.LIMIT}
            />
          )}
        </Flex>
        {pinned && (
          <Box p={2} r={"md"} intensity={700} position={"relative"}>
            <AdditionalInfoWidget
              pinned={pinned}
              setPinned={setPinned}
              needConfirm={needConfirm}
              setNeedConfirm={setNeedConfirm}
              onValueChange={setOrderValue}
              orderTypeExtra={formattedOrder["order_type_ext"]}
              showExtra={formattedOrder["order_type"] === OrderType.LIMIT}
            />
            <button
              onClick={() => {
                setPinned(false);
              }}
              className={"oui-absolute oui-top-2 oui-right-2"}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4.67 1.953A2.667 2.667 0 0 0 2.005 4.62v6.667a2.667 2.667 0 0 0 2.667 2.666h6.666a2.667 2.667 0 0 0 2.667-2.666V4.62a2.667 2.667 0 0 0-2.667-2.667zm1.334 3.334c.17 0 .349.057.48.187l1.52 1.52 1.52-1.52a.68.68 0 0 1 .48-.187c.17 0 .349.057.48.187.26.26.26.698 0 .958L8.962 7.954l1.52 1.52c.26.262.26.699 0 .96a.687.687 0 0 1-.958 0l-1.52-1.522-1.52 1.52a.687.687 0 0 1-.96 0 .687.687 0 0 1 0-.958l1.521-1.52-1.52-1.521a.687.687 0 0 1 0-.96.68.68 0 0 1 .479-.186"
                  fill="#fff"
                  fillOpacity=".2"
                />
              </svg>
            </button>
          </Box>
        )}
      </div>
    </OrderEntryProvider>
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
              props.onChange("trigger_price", e.target.value);
            }}
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
              props.onChange("order_price", e.target.value);
            }}
            onFocus={onFocus(InputType.PRICE)}
            onBlur={onBlur(InputType.PRICE)}
          />
        </div>
      ) : null}

      <Flex className={"oui-space-x-1 oui-group"}>
        <CustomInput
          label={"Quantity"}
          suffix={symbolInfo.base}
          id="order_quantity_input"
          name="order_quantity_input"
          className={"!oui-rounded-br !oui-rounded-tr"}
          value={values.quantity}
          error={parseErrorMsg("order_quantity")}
          onChange={(e) => {
            props.onChange("order_quantity", e.target.value);
          }}
          onFocus={onFocus(InputType.QUANTITY)}
          onBlur={onBlur(InputType.QUANTITY)}
        />
        <CustomInput
          label={"Total≈"}
          suffix={symbolInfo.quote}
          id={"total"}
          className={"!oui-rounded-bl !oui-rounded-tl"}
          value={values.total}
          onChange={(e) => {
            props.onChange("total", e.target.value);
          }}
          onFocus={onFocus(InputType.TOTAL)}
          onBlur={onBlur(InputType.TOTAL)}
        />
      </Flex>
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
    onChange?: InputProps["onChange"];
    value?: InputProps["value"];
    autoFocus?: InputProps["autoFocus"];
    error?: string;
    onFocus: InputProps["onFocus"];
    onBlur: InputProps["onBlur"];
    // helperText?: InputProps["helperText"];
  }
>((props, ref) => {
  const { errorMsgVisible } = useContext(OrderEntryContext);
  return (
    <Input.tooltip
      ref={ref}
      tooltip={errorMsgVisible ? props.error : undefined}
      autoComplete={"off"}
      autoFocus={props.autoFocus}
      size={"lg"}
      placeholder={"0"}
      id={props.id}
      name={props.name}
      color={props.error ? "danger" : undefined}
      prefix={<InputLabel id={props.id}>{props.label}</InputLabel>}
      suffix={props.suffix}
      value={props.value}
      onChange={props.onChange}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      formatters={[
        inputFormatter.numberFormatter,
        inputFormatter.currencyFormatter,
      ]}
      classNames={{
        root: cn(
          "oui-relative oui-pt-8 oui-h-[54px] oui-px-2 oui-py-1 oui-pr-10 oui-border oui-border-solid oui-border-line oui-rounded group-first:oui-rounded-t-xl group-last:oui-rounded-b-xl",
          props.className
        ),
        input: "oui-mt-5 oui-mb-1 oui-h-5",
        prefix:
          "oui-absolute oui-left-2 oui-top-[7px] oui-text-base-contrast-36",
        suffix:
          "oui-absolute oui-right-0 oui-top-0 oui-text-base-contrast-36 oui-text-2xs",
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
  side: OrderSide;
  value: number;
  maxQty: number;
  currentQtyPercentage: number;
  tick: number;
  dp: number;
  setMaxQty: () => void;
  onValueChange: (value: number) => void;
}) => {
  const color = useMemo(
    () => (props.side === OrderSide.BUY ? "buy" : "sell"),
    [props.side]
  );

  return (
    <div>
      <Slider.single
        disabled={props.maxQty === 0}
        value={props.value}
        color={color}
        markCount={4}
        showTip
        max={props.maxQty}
        step={props.tick}
        onValueChange={props.onValueChange}
      />
      <Flex justify={"between"} pt={2}>
        <Text.numeral rule={"percentages"} size={"2xs"} color={color}>
          {props.currentQtyPercentage}
        </Text.numeral>
        <Flex>
          <button
            className={textVariants({
              size: "2xs",
              className: "oui-mr-1",
            })}
            onClick={() => props.setMaxQty()}
          >
            Max buy
          </button>
          <Text.numeral size={"2xs"} color={color} dp={props.dp}>
            {props.maxQty}
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
}) => {
  return (
    <Select.options
      value={props.type}
      options={[
        { label: "Limit", value: OrderType.LIMIT },
        { label: "Market", value: OrderType.MARKET },
        { label: "Stop Limit", value: OrderType.STOP_LIMIT },
        { label: "Stop Market", value: OrderType.STOP_MARKET },
      ]}
      onValueChange={props.onChange}
      size={"md"}
    />
  );
};

// -----------Order type Select Component end ------------

function AssetInfo(props: {
  quote: string;
  estLiqPrice: number | null;
  estLeverage: number | null;
  currentLeverage: number;
}) {
  return (
    <div className={"oui-space-y-1"}>
      <Flex justify={"between"}>
        <Text size={"2xs"}>Est. Liq. price</Text>
        <Text.numeral
          unit={props.quote}
          size={"2xs"}
          className={"oui-text-base-contrast-80"}
          unitClassName={"oui-ml-1 oui-text-base-contrast-36"}
        >
          {props.estLiqPrice ?? "--"}
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
          <Text.numeral unit="x">{props.currentLeverage}</Text.numeral>
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
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M3.332 2.665a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V3.332a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V3.332a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V3.332a.667.667 0 0 0-.667-.667zm-8 4a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V7.332a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V7.332a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667V7.332a.667.667 0 0 0-.667-.667zm-8 4a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667v-1.333a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667v-1.333a.667.667 0 0 0-.667-.667zm4 0a.667.667 0 0 0-.667.667v1.333c0 .368.299.667.667.667h1.333a.667.667 0 0 0 .667-.667v-1.333a.667.667 0 0 0-.667-.667z"
              fill="#fff"
              fillOpacity={open ? 0.8 : 0.36}
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
