import { uesOrderEntryScriptReturn } from "./useOrderEntry.script";
import { AuthGuard } from "@orderly.network/ui-connector";
import {
  Button,
  cn,
  Divider,
  Flex,
  Input,
  InputProps,
  Select,
  Slider,
  Switch,
  Text,
  textVariants,
} from "@orderly.network/ui";
import { PropsWithChildren, useMemo } from "react";
import { OrderSide, OrderType } from "@orderly.network/types";
import { OrderTPSL } from "./components/tpsl";
import { API } from "@orderly.network/types";

export const OrderEntry = (props: uesOrderEntryScriptReturn) => {
  const { side, orderEntity, setOrderValue, symbolInfo } = props;
  const buttonLabel = useMemo(() => {
    return side === OrderSide.BUY ? "Buy / Long" : "Sell / Short";
  }, [side]);

  return (
    <div className={"oui-space-y-3 oui-text-base-contrast-54"}>
      <Flex gapX={2}>
        <Flex className={"oui-flex-1 oui-gap-x-1"}>
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
        </Flex>
        <div className={"oui-flex-1"}>
          <OrderTypeSelect
            type={orderEntity.type}
            onChange={(type) => {
              setOrderValue("type", type);
            }}
          />
        </div>
      </Flex>
      <Flex justify={"between"}>
        <Text size={"2xs"}>Available</Text>
        <Text.numeral
          unit={symbolInfo.quote}
          size={"2xs"}
          unitClassName={"oui-ml-1"}
        >
          0
        </Text.numeral>
      </Flex>
      <OrderQuantityInput
        type={props.type}
        symbolInfo={symbolInfo}
        values={{
          quantity: orderEntity.quantity,
          price: orderEntity.price,
          trigger_price: orderEntity.trigger_price,
          total: orderEntity.total,
        }}
        onChange={(key, value) => {
          props.setOrderValue(key, value);
        }}
      />
      <QuantitySlider maxQty={0} setMaxQty={() => {}} side={props.side} />
      <AuthGuard buttonProps={{ fullWidth: true }}>
        <Button fullWidth color={side === OrderSide.BUY ? "buy" : "sell"}>
          {buttonLabel}
        </Button>
      </AuthGuard>
      <AssetInfo quote={symbolInfo.quote} />
      <Divider />
      <OrderTPSL
        onCancelTPSL={props.cancelTP_SL}
        values={{
          tp: {
            trigger_price: orderEntity.tp_trigger_price ?? "",
            PnL: orderEntity.tp_pnl ?? "",
            Offset: orderEntity.tp_offset ?? "",
            "Offset%": orderEntity.tp_offset_percentage ?? "",
          },
          sl: {
            trigger_price: orderEntity.sl_trigger_price ?? "",
            PnL: orderEntity.sl_pnl ?? "",
            Offset: orderEntity.sl_offset ?? "",
            "Offset%": orderEntity.sl_offset_percentage ?? "",
          },
        }}
        onChange={(key, value) => {
          props.setOrderValue(key, value);
        }}
      />
      <Flex itemAlign={"center"} gapX={1}>
        <Switch
          id={"reduceOnly"}
          checked={props.orderEntity.reduce_only}
          onCheckedChange={(checked) => {
            // console.log(checked);
            props.setOrderValue("reduce_only", checked);
          }}
        />
        <label htmlFor={"reduceOnly"} className={"oui-text-xs"}>
          Reduce only
        </label>
      </Flex>
    </div>
  );
};

//----------------- Order Quantity Input Component start -----------------
const OrderQuantityInput = (props: {
  type: OrderType;
  symbolInfo: API.SymbolExt;
  values: {
    quantity?: string;
    price?: string;
    trigger_price?: number;
    total?: string;
  };
  onChange: (
    key: "quantity" | "price" | "trigger_price" | "total",
    value: any
  ) => void;
}) => {
  const { type, symbolInfo } = props;
  return (
    <div className={"oui-space-y-1"}>
      {type === OrderType.STOP_LIMIT || type === OrderType.STOP_MARKET ? (
        <div className={"oui-group"}>
          <CustomInput
            label={"Trigger"}
            suffix={symbolInfo.quote}
            id={"trigger"}
            value={props.values.trigger_price}
            onChange={(e) => {
              props.onChange("trigger_price", e.target.value);
            }}
          />
        </div>
      ) : null}

      {type === OrderType.LIMIT || type === OrderType.STOP_LIMIT ? (
        <div className={"oui-group"}>
          <CustomInput
            label={"Price"}
            suffix={symbolInfo.quote}
            id={"price"}
            value={props.values.price}
            // helperText="Price per unit"
            onChange={(e) => {
              props.onChange("price", e.target.value);
            }}
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
          value={props.values.quantity}
          onChange={(e) => {
            props.onChange("quantity", e.target.value);
          }}
        />
        <CustomInput
          label={"Total≈"}
          suffix={symbolInfo.quote}
          id={"total"}
          className={"!oui-rounded-bl !oui-rounded-tl"}
          value={props.values.total}
          onChange={(e) => {
            props.onChange("total", e.target.value);
          }}
        />
      </Flex>
    </div>
  );
};

// ----------- Custom Input Component start ------------
const CustomInput = (props: {
  label: string;
  suffix: string;
  id: string;
  className?: string;
  name?: string;
  onChange?: InputProps["onChange"];
  value?: InputProps["value"];
  // helperText?: InputProps["helperText"];
}) => {
  return (
    <Input
      autoComplete={"off"}
      size={"lg"}
      placeholder={"0"}
      id={props.id}
      name={props.name}
      prefix={<InputLabel id={props.id}>{props.label}</InputLabel>}
      suffix={props.suffix}
      value={props.value}
      onChange={props.onChange}
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
};

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
  maxQty: number;
  setMaxQty: () => void;
}) => {
  const color = useMemo(
    () => (props.side === OrderSide.BUY ? "buy" : "sell"),
    [props.side]
  );

  return (
    <div>
      <Slider color={color} markCount={4} />
      <Flex justify={"between"} pt={2}>
        <Text.numeral rule={"percentages"} size={"2xs"} color={color}>
          0
        </Text.numeral>
        <Flex>
          <button
            className={textVariants({
              // color: "buy",
              size: "2xs",
              className: "oui-mr-1",
            })}
          >
            Max buy
          </button>
          <Text.numeral size={"2xs"} color={color}>
            34567
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

function AssetInfo(props: { quote: string }) {
  return (
    <div className={"oui-space-y-1"}>
      <Flex justify={"between"}>
        <Text size={"2xs"}>Est. Liq. price</Text>
        <Text.numeral unit={props.quote} size={"2xs"}>
          --
        </Text.numeral>
      </Flex>
      <Flex justify={"between"}>
        <Text size={"2xs"}>Account leverage</Text>
        <Text.numeral unit={"x"} size={"2xs"}>
          --
        </Text.numeral>
      </Flex>
    </div>
  );
}
