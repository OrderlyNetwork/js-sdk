import React, {
  ChangeEventHandler,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  cn,
  Flex,
  Text,
  Input,
  inputFormatter,
  modal,
  Switch,
} from "@orderly.network/ui";
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
import { ExclamationFillIcon } from "@orderly.network/ui";

type OrderValueKeys = keyof OrderlyOrder;

type Est_Values = PNL_Values & {
  trigger_price?: string;
};

type TPSL_Values = { tp: Est_Values; sl: Est_Values };

export const OrderTPSL = (props: {
  // onCancelTPSL: () => void;
  // onEnableTP_SL: () => void;
  switchState: boolean;
  onSwitchChanged: (state: boolean) => void;
  onChange: (key: OrderValueKeys, value: any) => void;
  values: TPSL_Values;
  orderType: OrderType;
  isReduceOnly?: boolean;
  errors: any;
  quote_dp: number | undefined;
}) => {
  // const [open, setOpen] = useState(false);
  const tpslFormRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (
      props.orderType !== OrderType.LIMIT &&
      props.orderType !== OrderType.MARKET
    ) {
      // setOpen(false);
      props.onSwitchChanged(false);

      // props.onCancelTPSL();
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
          checked={props.switchState}
          disabled={
            (props.orderType !== OrderType.LIMIT &&
              props.orderType !== OrderType.MARKET) ||
            props.isReduceOnly
          }
          onCheckedChange={(checked) => {
            // setOpen(checked);
            props.onSwitchChanged(checked);
            // if (!checked) {
            //   props.onCancelTPSL();
            // } else {
            //   props.onEnableTP_SL();
            // }
          }}
        />
        <label htmlFor={"order_entry_tpsl"} className={"oui-text-xs"}>
          TP/SL
        </label>
        <ExclamationFillIcon
          color="white"
          // opacity={0.36}
          size={14}
          opacity={1}
          className="oui-text-white/[.36] hover:oui-text-white/80 oui-cursor-pointer"
          onClick={() => {
            modal.dialog({
              title: "Tips",
              size: "xs",
              content: (
                <Text intensity={54}>
                  Set TP/SL to trigger at a specified price and execute as a
                  market order. By default, TP/SL applies to the entire
                  position. For partial TP/SL, adjust settings in the open
                  positions section.
                </Text>
              ),
            });
          }}
        />
      </Flex>
      <div
        className={cn(
          "oui-max-h-0 oui-overflow-hidden oui-transition-all",
          props.switchState && "oui-max-h-[100px]"
        )}
        onTransitionEnd={() => {
          console.log("transition end");
          tpslFormRef.current?.style.setProperty(
            "opacity",
            props.switchState ? "1" : "0"
          );
        }}
      >
        <TPSLInputForm
          ref={tpslFormRef}
          onChange={props.onChange}
          values={props.values}
          errors={props.errors}
          quote_dp={props.quote_dp}
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
    quote_dp: number | undefined;
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
          quote_dp={props.quote_dp}
          testIds={{
            first: "oui-testid-orderEntry-tpsl-tpPrice-input",
            second: "oui-testid-orderEntry-tpsl-tpPnl-input",
            dropDown: "oui-testid-orderEntry-tpsl-tp-dropDown-trigger-button",
          }}
        />
      </PnlInputProvider>
      <PnlInputProvider values={props.values.sl} type={"SL"}>
        <TPSLInputRow
          type={"SL"}
          error={props.errors ? props.errors["sl_trigger_price"]?.message : ""}
          onChange={props.onChange}
          values={props.values.sl}
          quote_dp={props.quote_dp}
          testIds={{
            first: "oui-testid-orderEntry-tpsl-slPrice-input",
            second: "oui-testid-orderEntry-tpsl-slPnl-input",
            dropDown: "oui-testid-orderEntry-tpsl-sl-dropDown-trigger-button",
          }}
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
  onChange: (value: string) => void;
  quote_dp: number | undefined;
  testId?: string;
}) => {
  const { errorMsgVisible } = useContext(OrderEntryContext);
  const { tipsEle } = usePnlInputContext();
  const [prefix, setPrefix] = useState<string>(`${props.type} Price`);
  const [placeholder, setPlaceholder] = useState<string>("USDC");

  const [tipVisible, setTipVisible] = useState(false);

  const triggerPriceToolTipEle = useMemo(() => {
    if (props.error && errorMsgVisible) return props.error;
    if (tipVisible) return tipsEle;

    return null;
  }, [props.error, errorMsgVisible, tipVisible, tipsEle]);

  const priceKey =
    props.type === "SL" ? "sl_trigger_price" : "tp_trigger_price";

  useEffect(() => {
    setPrefix(
      !!props.values.trigger_price ? props.type : `${props.type} Price`
    );
  }, [props.values.trigger_price]);

  return (
    <Input.tooltip
      data-testid={props.testId}
      prefix={prefix}
      size={"md"}
      placeholder={placeholder}
      align="right"
      onFocus={() => {
        setPrefix(props.type);
        setPlaceholder("");
        setTipVisible(true);
      }}
      onBlur={() => {
        setPrefix(
          !!props.values.trigger_price ? props.type : `${props.type} Price`
        );
        setPlaceholder("USDC");
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
      // onChange={props.onChange}
      onValueChange={props.onChange}
      formatters={[
        inputFormatter.numberFormatter,
        inputFormatter.dpFormatter(props.quote_dp ?? 2),
        inputFormatter.currencyFormatter,
      ]}
    />
  );
};

//------- TPSLTriggerPriceInput end -------

const TPSLInputRow = (props: {
  type: "TP" | "SL";
  values: Est_Values;
  error?: string;
  onChange: (key: OrderValueKeys, value: any) => void;
  quote_dp: number | undefined;
  testIds?: {
    first?: string;
    second?: string;
    dropDown?: string;
  };
}) => {
  const priceKey =
    props.type === "SL" ? "sl_trigger_price" : "tp_trigger_price";

  return (
    <Grid cols={2} gapX={1}>
      <TPSLTriggerPriceInput
        testId={props.testIds?.first}
        type={props.type}
        error={props.error}
        values={props.values ?? ""}
        onChange={(event) => {
          props.onChange(priceKey, event);
        }}
        quote_dp={props.quote_dp}
      />

      <PnlInputWidget
        testIds={{
          input: props.testIds?.second,
          dropDown: props.testIds?.dropDown,
        }}
        onChange={props.onChange}
        quote={"USDC"}
        quote_dp={props.quote_dp}
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
