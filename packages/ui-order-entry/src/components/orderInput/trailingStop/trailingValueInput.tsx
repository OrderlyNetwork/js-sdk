import { FC, memo, useEffect } from "react";
import { useLocalStorage } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { inputFormatter } from "@orderly.network/ui";
import { InputType } from "../../../types";
import { CustomInput } from "../../customInput";
import { useOrderEntryContext } from "../../orderEntryContext";
import { CallbackRatePercentages } from "./callbackRatePercentages";
import { CallbackUnit, CallbackUnitValue } from "./callbackUnit";

type TrailingValueInputProps = {
  callback_value?: string;
  callback_rate?: string;
};

export const TrailingValueInput: FC<TrailingValueInputProps> = memo((props) => {
  const { t } = useTranslation();
  const { symbolInfo, onFocus, onBlur, getErrorMsg, setOrderValue } =
    useOrderEntryContext();

  const [callbackUnit, setCallbackUnit] = useLocalStorage<CallbackUnitValue>(
    "orderly_order_trailing_callback_unit",
    "quote",
  );

  useEffect(() => {
    if (callbackUnit) {
      requestAnimationFrame(() => {
        setOrderValue("callback_unit", callbackUnit);
      });
    }
  }, [callbackUnit]);

  const suffix = (
    <CallbackUnit
      quote={symbolInfo.quote}
      value={callbackUnit}
      onValueChange={setCallbackUnit}
    />
  );

  if (callbackUnit === "percentage") {
    return (
      <div className="oui-relative">
        <CustomInput
          id="order_callback_rate_input"
          name="order_callback_rate_input"
          label={t("orderEntry.trailingRate")}
          suffix={suffix}
          error={getErrorMsg("callback_rate")}
          value={props.callback_rate}
          onChange={(val: string) => {
            setOrderValue("callback_rate", val);
          }}
          formatters={[inputFormatter.dpFormatter(1)]}
          onFocus={onFocus(InputType.CALLBACK_RATE)}
          onBlur={onBlur(InputType.CALLBACK_RATE)}
          classNames={{
            root: "oui-h-[68px]",
            input: "oui-mb-5",
            prefix: "!oui-top-1",
          }}
        />
        <CallbackRatePercentages
          className="oui-absolute oui-bottom-1 oui-left-2"
          callback_rate={props.callback_rate}
        />
      </div>
    );
  }

  return (
    <CustomInput
      id="order_callback_value_input"
      name="order_callback_value_input"
      label={t("orderEntry.trailingValue")}
      suffix={suffix}
      error={getErrorMsg("callback_value")}
      value={props.callback_value}
      onChange={(val: string) => {
        setOrderValue("callback_value", val);
      }}
      formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
      onFocus={onFocus(InputType.CALLBACK_VALUE)}
      onBlur={onBlur(InputType.CALLBACK_VALUE)}
      classNames={{
        input: "!oui-mb-[6px]",
        prefix: "!oui-top-1",
      }}
    />
  );
});

TrailingValueInput.displayName = "TrailingValueInput";
