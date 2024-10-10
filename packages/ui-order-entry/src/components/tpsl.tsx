import React, { useContext, useEffect, useMemo, useState } from "react";
import { cn, Flex, Input, Switch } from "@orderly.network/ui";
import { Grid } from "@orderly.network/ui";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { OrderlyOrder } from "@orderly.network/types";
import { PNL_Values, PnLMode } from "./pnlInput/useBuilder.script";
import { OrderType } from "@orderly.network/types";
import { OrderEntryContext } from "./orderEntryContext";

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

  return (
    <div>
      <Flex itemAlign={"center"} gapX={1}>
        <Switch
          id={"order_entry_tpsl"}
          checked={open}
          disabled={
            props.orderType !== OrderType.LIMIT &&
            props.orderType !== OrderType.MARKET
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
      className={"oui-transition-all oui-pt-2 oui-pb-2 oui-px-1 oui-space-y-1"}
    >
      <TPSLInputRow
        type={"TP"}
        error={props.errors ? props.errors["tp_trigger_price"]?.message : ""}
        onChange={props.onChange}
        values={props.values.tp}
      />
      <TPSLInputRow
        type={"SL"}
        error={props.errors ? props.errors["sl_trigger_price"]?.message : ""}
        onChange={props.onChange}
        values={props.values.sl}
      />
    </div>
  );
});

TPSLInputForm.displayName = "TPSLInputForm";

const TPSLInputRow = (props: {
  type: "TP" | "SL";
  values: Est_Values;
  error?: string;
  onChange: (key: OrderValueKeys, value: any) => void;
}) => {
  const { values } = props;
  const priceKey =
    props.type === "SL" ? "sl_trigger_price" : "tp_trigger_price";

  const { errorMsgVisible } = useContext(OrderEntryContext);

  const [tips, setTips] = useState<
    | {
        msg: string;
        type: "Error" | "PnL";
      }
    | undefined
  >(props.error ? { msg: props.error, type: "Error" } : undefined);

  function updateTips() {
    if (!values.PnL) {
      setTips(undefined);
      return;
    }
    // if (mode === PnLMode.PnL) {
    //   setTips({
    //     msg: values.Offset,
    //     type: "ROI",
    //   });
    // } else {
    //   setTips({
    //     msg: values.PnL,
    //     type: "PnL",
    //   });
    // }
  }

  const triggerPriceToolTipEle = useMemo(() => {
    if (typeof tips === "undefined" || !errorMsgVisible) return null;
    if (!!tips && tips.type === "Error") return tips.msg;
  }, [tips, errorMsgVisible]);

  return (
    <div>
      <Grid cols={2} gapX={1}>
        <Input.tooltip
          prefix={"TP Price"}
          size={"md"}
          placeholder="USDC"
          align="right"
          onFocus={() => {
            // const tips =
            // setTooltip(!props.error ? props.error : "ROI");
          }}
          onBlur={() => {
            setTips(
              props.error ? { msg: props.error, type: "Error" } : undefined
            );
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
          classNames={{ additional: "oui-text-base-contrast-54" }}
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
          }}
        />
      </Grid>
    </div>
  );
};
