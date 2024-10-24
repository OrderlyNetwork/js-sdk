import React, {
  ChangeEventHandler,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { cn, Flex, Input, Switch } from "@orderly.network/ui";
import { Grid } from "@orderly.network/ui";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { OrderlyOrder } from "@orderly.network/types";
import { PNL_Values, PnLMode } from "./pnlInput/useBuilder.script";
import { OrderType } from "@orderly.network/types";
import { OrderEntryContext } from "./orderEntryContext";
import {
  PnlInputProvider,
  usePnlInputContext,
} from "./pnlInput/pnlInputContext";

type OrderValueKeys = keyof OrderlyOrder;

type Est_Values = PNL_Values & {
  trigger_price?: string;
};

type TPSL_Values = { tp: Est_Values; sl: Est_Values };

export const OrderTPSL = (props: {
  onCancelTPSL: () => void;
  onChange: (key: OrderValueKeys, value: any) => void;
  values: TPSL_Values;
  orderType: OrderType;
  isReduceOnly?: boolean;
  errors: any;
}) => {
  const [open, setOpen] = useState(false);
  const tpslFormRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      props.orderType !== OrderType.LIMIT &&
      props.orderType !== OrderType.MARKET
    ) {
      setOpen(false);

      props.onCancelTPSL();
    }
  }, [props.orderType]);

  if (
    (props.orderType !== OrderType.LIMIT &&
      props.orderType !== OrderType.MARKET) ||
    props.isReduceOnly
  )
    return null;

  return (
    <div>
      <Flex itemAlign={"center"} gapX={1}>
        <Switch
          id={"order_entry_tpsl"}
          className="oui-h-[14px]"
          checked={open}
          disabled={
            (props.orderType !== OrderType.LIMIT &&
              props.orderType !== OrderType.MARKET) ||
            props.isReduceOnly
          }
          onCheckedChange={(checked) => {
            setOpen(checked);
            if (!checked) {
              props.onCancelTPSL();
            }
          }}
        />
        <label htmlFor={"order_entry_tpsl"} className={"oui-text-xs"}>
          TP/SL
        </label>
      </Flex>
      <div
        className={cn(
          "oui-max-h-0 oui-overflow-hidden oui-transition-all",
          open && "oui-max-h-[100px]"
        )}
        onTransitionEnd={() => {
          console.log("transition end");
          tpslFormRef.current?.style.setProperty("opacity", open ? "1" : "0");
        }}
      >
        <TPSLInputForm
          ref={tpslFormRef}
          onChange={props.onChange}
          values={props.values}
          errors={props.errors}
        />
      </div>
    </div>
  );
};

const TPSLInputForm = React.forwardRef<
  HTMLDivElement,
  {
    onChange: (key: OrderValueKeys, value: any) => void;
    values: TPSL_Values;
    errors: Record<string, { message: string }> | null;
  }
>((props, ref) => {
  return (
    <div
      ref={ref}
      className={
        "oui-transition-all oui-pt-2 oui-pb-2 oui-px-[1px] oui-space-y-1"
      }
    >
      <PnlInputProvider values={props.values.tp} type={"TP"}>
        <TPSLInputRow
          type={"TP"}
          error={props.errors ? props.errors["tp_trigger_price"]?.message : ""}
          onChange={props.onChange}
          values={props.values.tp}
        />
      </PnlInputProvider>
      <PnlInputProvider values={props.values.sl} type={"SL"}>
        <TPSLInputRow
          type={"SL"}
          error={props.errors ? props.errors["sl_trigger_price"]?.message : ""}
          onChange={props.onChange}
          values={props.values.sl}
        />
      </PnlInputProvider>
    </div>
  );
});

TPSLInputForm.displayName = "TPSLInputForm";

//------- TPSLTriggerPriceInput start -------
const TPSLTriggerPriceInput = (props: {
  type: "TP" | "SL";
  error: string | undefined;
  values: Est_Values;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
}) => {
  const { errorMsgVisible } = useContext(OrderEntryContext);
  const { tipsEle } = usePnlInputContext();

  const [tipVisible, setTipVisible] = useState(false);

  const triggerPriceToolTipEle = useMemo(() => {
    if (props.error && errorMsgVisible) return props.error;
    if (tipVisible) return tipsEle;

    return null;
  }, [props.error, errorMsgVisible, tipVisible, tipsEle]);

  return (
    <Input.tooltip
      prefix={`${props.type} Price`}
      size={"md"}
      placeholder="USDC"
      align="right"
      onFocus={() => {
        setTipVisible(true);
      }}
      onBlur={() => {
        setTipVisible(false);
      }}
      tooltip={triggerPriceToolTipEle}
      tooltipProps={{
        content: {
          side: props.type === "TP" ? "top" : "bottom",
        },
      }}
      color={props.error ? "danger" : undefined}
      autoComplete={"off"}
      value={props.values.trigger_price}
      classNames={{
        additional: "oui-text-base-contrast-54",
        root: "oui-pr-2 md:oui-pr-3",
        prefix: "oui-pr-1 md:oui-pr-2",
      }}
      onChange={props.onChange}
    />
  );
};

//------- TPSLTriggerPriceInput end -------

const TPSLInputRow = (props: {
  type: "TP" | "SL";
  values: Est_Values;
  error?: string;
  onChange: (key: OrderValueKeys, value: any) => void;
}) => {
  const priceKey =
    props.type === "SL" ? "sl_trigger_price" : "tp_trigger_price";

  return (
    <Grid cols={2} gapX={1}>
      <TPSLTriggerPriceInput
        type={props.type}
        error={props.error}
        values={props.values ?? ""}
        onChange={(event) => {
          props.onChange(priceKey, event.target.value);
        }}
      />

      <PnlInputWidget
        onChange={props.onChange}
        quote={"USDC"}
        type={props.type}
        values={{
          PnL: props.values.PnL,
          Offset: props.values.Offset,
          "Offset%": props.values["Offset%"],
          ROI: props.values.ROI,
        }}
      />
    </Grid>
  );
};
