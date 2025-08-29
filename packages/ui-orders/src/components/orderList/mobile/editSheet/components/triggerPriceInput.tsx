import { memo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Input, inputFormatter, Text } from "@orderly.network/ui";
import { useEditSheetContext } from "./editSheetContext";

type TriggerPriceInputProps = {
  value?: string | number;
};

export const TriggerPriceInput = memo((props: TriggerPriceInputProps) => {
  const { t } = useTranslation();

  const { symbolInfo, setOrderValue, getErrorMsg } = useEditSheetContext();
  const { quote, quote_dp } = symbolInfo;

  const error = getErrorMsg("order_price");

  return (
    <Input.tooltip
      prefix={
        <Text intensity={54} className="oui-px-3">
          {t("common.triggerPrice")}
        </Text>
      }
      suffix={
        <Text intensity={54} className="oui-px-3">
          {quote}
        </Text>
      }
      color={error ? "danger" : undefined}
      align="right"
      fullWidth
      autoComplete="off"
      formatters={[
        inputFormatter.numberFormatter,
        inputFormatter.dpFormatter(quote_dp),
      ]}
      value={props.value}
      onValueChange={(val) => setOrderValue("trigger_price", val)}
      tooltip={error}
      tooltipProps={{
        content: {
          className: "oui-bg-base-6 oui-text-base-contrast-80",
        },
        arrow: {
          className: "oui-fill-base-6",
        },
      }}
      classNames={{
        input: "oui-text-base-contrast oui-w-full",
        root: cn("oui-outline-line-12", error && "oui-outline-danger"),
      }}
    />
  );
});

TriggerPriceInput.displayName = "TriggerPriceInput";
