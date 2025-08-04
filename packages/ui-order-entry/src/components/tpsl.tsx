import React, {
  ChangeEventHandler,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { OrderValidationResult } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { useOrderEntryFormErrorMsg } from "@orderly.network/react-app";
import { OrderlyOrder, OrderType, PositionType } from "@orderly.network/types";
import {
  cn,
  Flex,
  Text,
  Input,
  inputFormatter,
  modal,
  Switch,
  SettingFillIcon,
  Box,
} from "@orderly.network/ui";
import { Grid } from "@orderly.network/ui";
import { ExclamationFillIcon } from "@orderly.network/ui";
import {
  TPSLAdvancedDialogId,
  TPSLAdvancedWidget,
  TPSLPositionTypeWidget,
} from "@orderly.network/ui-tpsl";
import { OrderEntryContext } from "./orderEntryContext";
import { PnlInputWidget } from "./pnlInput/pnlInput.widget";
import {
  PnlInputProvider,
  usePnlInputContext,
} from "./pnlInput/pnlInputContext";
import { PNL_Values, PnLMode } from "./pnlInput/useBuilder.script";

type OrderValueKeys = keyof OrderlyOrder;

type Est_Values = PNL_Values & {
  trigger_price?: string;
};

type TPSL_Values = {
  tp: Est_Values;
  sl: Est_Values;
  position_type: PositionType;
};

export const OrderTPSL = (props: {
  // onCancelTPSL: () => void;
  // onEnableTP_SL: () => void;
  switchState: boolean;
  onSwitchChanged: (state: boolean) => void;
  onChange: (key: OrderValueKeys, value: any) => void;
  values: TPSL_Values;
  orderType: OrderType;
  isReduceOnly?: boolean;
  errors: OrderValidationResult | null;
  quote_dp: number | undefined;
  showTPSLAdvanced: () => void;
  setOrderValue: (key: string, value: any) => void;
}) => {
  // const [open, setOpen] = useState(false);
  const tpslFormRef = React.useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

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
      <Flex itemAlign={"center"} justify={"between"}>
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
            {t("common.tpsl")}
          </label>
          {/* <ExclamationFillIcon
            color="white"
            // opacity={0.36}
            size={14}
            opacity={1}
            className="oui-cursor-pointer oui-text-white/[.36] hover:oui-text-white/80"
            onClick={() => {
              modal.dialog({
                title: t("common.tips"),
                size: "xs",
                content: (
                  <Text intensity={54}>{t("orderEntry.tpsl.tips")}</Text>
                ),
              });
            }}
          /> */}
        </Flex>
        <Flex
          itemAlign={"center"}
          gapX={1}
          onClick={props.showTPSLAdvanced}
          className={cn(
            "oui-group oui-invisible",
            props.switchState && "oui-visible",
          )}
        >
          <Text className="oui-text-sm oui-cursor-pointer group-hover:oui-text-base-contrast">
            {t("tpsl.advanced")}
          </Text>
          {/* <AdvancedIcon/> */}
          <SettingFillIcon
            size={12}
            className="oui-text-base-contrast-54 group-hover:oui-text-base-contrast oui-cursor-pointer"
            opacity={1}
            onClick={props.showTPSLAdvanced}
          />
        </Flex>
      </Flex>
      <div
        className={cn(
          "oui-max-h-0 oui-overflow-hidden oui-transition-all",
          props.switchState && "oui-max-h-[120px]",
        )}
        onTransitionEnd={() => {
          console.log("transition end");
          tpslFormRef.current?.style.setProperty(
            "opacity",
            props.switchState ? "1" : "0",
          );
        }}
      >
        <TPSLInputForm
          ref={tpslFormRef}
          setOrderValue={props.setOrderValue}
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
    setOrderValue: (key: string, value: any) => void;
    onChange: (key: OrderValueKeys, value: any) => void;
    values: TPSL_Values;
    errors: OrderValidationResult | null;
    quote_dp: number | undefined;
  }
>((props, ref) => {
  const { parseErrorMsg } = useOrderEntryFormErrorMsg(props.errors);

  return (
    <div
      ref={ref}
      className={"oui-space-y-1 oui-px-px oui-py-2 oui-transition-all"}
    >
      <TPSLPositionTypeWidget
        value={props.values.position_type}
        onChange={props.onChange}
      />
      <PnlInputProvider values={props.values.tp} type={"TP"}>
        <TPSLInputRow
          type={"TP"}
          error={parseErrorMsg("tp_trigger_price")}
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
          error={parseErrorMsg("sl_trigger_price")}
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
  const { t } = useTranslation();
  const { errorMsgVisible } = useContext(OrderEntryContext);
  const { tipsEle } = usePnlInputContext();
  const [prefix, setPrefix] = useState<string>(`${props.type} Price`);
  const [placeholder, setPlaceholder] = useState<string>("USDC");

  const [tipVisible, setTipVisible] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const [innerValue, setInnerValue] = useState<string>(
    props.values.trigger_price ?? "",
  );

  useEffect(() => {
    if (isFocused) {
      return;
    }
    setInnerValue(props.values.trigger_price ?? "");
  }, [props.values.trigger_price, isFocused]);

  const triggerPriceToolTipEle = useMemo(() => {
    if (props.error && errorMsgVisible) return props.error;
    if (tipVisible) return tipsEle;

    return null;
  }, [props.error, errorMsgVisible, tipVisible, tipsEle]);

  const getPrefixLabel = (trigger_price?: string) => {
    let _prefix = props.type === "TP" ? t("tpsl.tpPrice") : t("tpsl.slPrice");

    if (trigger_price) {
      _prefix = props.type === "TP" ? t("tpsl.tp") : t("tpsl.sl");
    }
    return _prefix;
  };

  const onValueChange = (value: string) => {
    setInnerValue(value);
    props.onChange(value);
  };

  // console.log("props.values.trigger_price", props.values.trigger_price);

  useEffect(() => {
    setPrefix(getPrefixLabel(props.values.trigger_price));

    if (!isFocused) {
      setInnerValue(props.values.trigger_price ?? "");
    }
  }, [props.type, props.values.trigger_price]);

  const onFocus = () => {
    setPrefix(props.type === "TP" ? t("tpsl.tp") : t("tpsl.sl"));
    setPlaceholder("");
    setTipVisible(true);
    setIsFocused(true);
  };

  const onBlur = () => {
    setPrefix(getPrefixLabel(props.values.trigger_price));
    setPlaceholder("USDC");
    setTipVisible(false);
    setIsFocused(false);
    props.onChange(innerValue);
  };

  return (
    <Input.tooltip
      data-testid={props.testId}
      prefix={prefix}
      size={"md"}
      placeholder={placeholder}
      align="right"
      onFocus={onFocus}
      onBlur={onBlur}
      tooltip={triggerPriceToolTipEle}
      tooltipProps={{
        content: {
          side: props.type === "TP" ? "top" : "bottom",
        },
      }}
      color={props.error ? "danger" : undefined}
      autoComplete={"off"}
      value={innerValue}
      classNames={{
        additional: "oui-text-base-contrast-54",
        root: "oui-pr-2 md:oui-pr-3",
        prefix: "oui-pr-1 md:oui-pr-2",
      }}
      // onChange={props.onChange}
      onValueChange={onValueChange}
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
        quote_dp={2}
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
