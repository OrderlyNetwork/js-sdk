import React, { useEffect, useState } from "react";
import { cn, Flex, Input, Switch } from "@orderly.network/ui";
import { Grid } from "@orderly.network/ui";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { OrderlyOrder } from "@orderly.network/types";
import { PNL_Values } from "./pnlInput/useBuilder.script";
import { OrderType } from "@orderly.network/types";

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
          id={"tpsl"}
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
        <label htmlFor={"tpsl"} className={"oui-text-xs"}>
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
  const priceKey =
    props.type === "SL" ? "sl_trigger_price" : "tp_trigger_price";

  const [tooltip, setTooltip] = useState(props.error);
  return (
    <div>
      <Grid cols={2} gapX={1}>
        <div>
          <Input.tooltip
            prefix={"TP Price"}
            size={"md"}
            placeholder="USDC"
            align="right"
            onFocus={() => {
              setTooltip(!props.error ? props.error : "ROI");
            }}
            onBlur={() => {
              setTooltip(props.error);
            }}
            tooltip={tooltip}
            color={props.error ? "danger" : undefined}
            autoComplete={"off"}
            value={props.values.trigger_price}
            classNames={{ additional: "oui-text-base-contrast-54" }}
            onChange={(event) => {
              props.onChange(priceKey, event.target.value);
            }}
          />
        </div>
        <div>
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
        </div>
      </Grid>
    </div>
  );
};
