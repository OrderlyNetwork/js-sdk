import React, { useState } from "react";
import { cn, Flex, Input, Switch } from "@orderly.network/ui";
import { Grid } from "@orderly.network/ui";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import { OrderlyOrder } from "@orderly.network/types";
import { PNL_Values } from "./pnlInput/useBuilder.script";

type OrderValueKeys = keyof OrderlyOrder;

type Est_Values = PNL_Values & {
  trigger_price?: number;
};

type TPSL_Values = { tp: Est_Values; sl: Est_Values };

export const OrderTPSL = (props: {
  onCancelTPSL: () => void;
  onChange: (key: OrderValueKeys, value: any) => void;
  values: TPSL_Values;
}) => {
  const [open, setOpen] = useState(false);
  const tpslFormRef = React.useRef<HTMLDivElement>(null);

  return (
    <div>
      <Flex itemAlign={"center"} gapX={1}>
        <Switch
          id={"tpsl"}
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
  }
>((props, ref) => {
  return (
    <div
      ref={ref}
      className={"oui-transition-all oui-pt-2 oui-pb-2 oui-px-1 oui-space-y-1"}
    >
      <TPSLInputRow
        type={"TP"}
        onChange={props.onChange}
        values={props.values.tp}
      />
      <TPSLInputRow
        type={"SL"}
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
  onChange: (key: OrderValueKeys, value: any) => void;
}) => {
  const priceKey =
    props.type === "SL" ? "sl_trigger_price" : "tp_trigger_price";
  return (
    <div>
      <Grid cols={2} gapX={1}>
        <div>
          <Input
            prefix={"TP Price"}
            size={"md"}
            placeholder="USDC"
            align="right"
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
