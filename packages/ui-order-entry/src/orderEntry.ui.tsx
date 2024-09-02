import { uesOrderEntryScriptReturn } from "./useOrderEntry.script";
import { AuthGuard } from "@orderly.network/ui-connector";
import {
  Button,
  cn,
  Divider,
  Flex,
  Input,
  Select,
  Slider,
  Switch,
  Text,
  textVariants,
} from "@orderly.network/ui";
import { PropsWithChildren, useMemo } from "react";
import { OrderSide, OrderType } from "@orderly.network/types";
import { OrderTPSL } from "./components/tpsl";

export const OrderEntry = (props: uesOrderEntryScriptReturn) => {
  const { side } = props;
  const buttonLabel = useMemo(() => {
    return side === OrderSide.BUY ? "Buy / Long" : "Sell / Short";
  }, [side]);
  return (
    <div className={"oui-space-y-3 oui-text-base-contrast-54"}>
      <Flex gapX={2}>
        <Flex className={"oui-flex-1 oui-gap-x-1"}>
          <Button
            onClick={() => {
              props.setOrderSide(OrderSide.BUY);
            }}
            size={"md"}
            fullWidth
            color={side === OrderSide.BUY ? "buy" : "secondary"}
          >
            Buy
          </Button>
          <Button
            onClick={() => {
              props.setOrderSide(OrderSide.SELL);
            }}
            fullWidth
            size={"md"}
            color={side === OrderSide.SELL ? "sell" : "secondary"}
          >
            Sell
          </Button>
        </Flex>
        <div className={"oui-flex-1"}>
          <OrderTypeSelect type={OrderType.LIMIT} />
        </div>
      </Flex>
      <Flex justify={"between"}>
        <Text size={"2xs"}>Available</Text>
        <Text.numeral unit={"USDC"} size={"2xs"} unitClassName={"oui-ml-1"}>
          0
        </Text.numeral>
      </Flex>
      <OrderQuantityInput type={props.type} />
      <QuantitySlider maxQty={0} setMaxQty={() => {}} side={props.side} />
      <AuthGuard buttonProps={{ fullWidth: true }}>
        <Button fullWidth color={side === OrderSide.BUY ? "buy" : "sell"}>
          {buttonLabel}
        </Button>
      </AuthGuard>
      <AssetInfo />
      <Divider />
      <OrderTPSL />
      <Flex itemAlign={"center"} gapX={1}>
        <Switch id={"reduceOnly"} />
        <label htmlFor={"reduceOnly"} className={"oui-text-xs"}>
          Reduce only
        </label>
      </Flex>
    </div>
  );
};

const OrderQuantityInput = (props: { type: OrderType }) => {
  return (
    <div className={"oui-space-y-[2px]"}>
      <div className={"oui-group"}>
        <CustomInput label={"Price"} suffix={"USDC"} id={"trigger"} />
      </div>
      <div className={"oui-group"}>
        <CustomInput label={"Price"} suffix={"USDC"} id={"price"} />
      </div>
      <Flex className={"oui-space-x-[2px] oui-group"}>
        <CustomInput
          label={"Quantity"}
          suffix={"BTC"}
          id={"quantity"}
          className={"!oui-rounded-br !oui-rounded-tr"}
        />
        <CustomInput
          label={"Total≈"}
          suffix={"USDC"}
          id={"total"}
          className={"!oui-rounded-bl !oui-rounded-tl"}
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
}) => {
  return (
    <Input
      autoComplete={"off"}
      size={"lg"}
      placeholder={"0"}
      id={props.id}
      prefix={<InputLabel id={props.id}>{props.label}</InputLabel>}
      suffix={props.suffix}
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

const OrderTypeSelect = (props: { type: OrderType }) => {
  return (
    <Select.options
      value={props.type}
      options={[
        { label: "Limit", value: OrderType.LIMIT },
        { label: "Market", value: OrderType.MARKET },
        { label: "Stop Limit", value: OrderType.STOP_LIMIT },
        { label: "Stop Market", value: OrderType.STOP_MARKET },
      ]}
      size={"md"}
    />
  );
};

// -----------Order type Select Component end ------------

function AssetInfo() {
  return (
    <div className={"oui-space-y-1"}>
      <Flex justify={"between"}>
        <Text size={"2xs"}>Est. Liq. price</Text>
        <Text.numeral unit={"USDC"} size={"2xs"}>
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
