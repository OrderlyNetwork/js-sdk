import { memo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Input, inputFormatter, Text } from "@orderly.network/ui";
import { useEditSheetContext } from "./editSheetContext";

type ActivitedPriceInputProps = {
  value?: string | number;
};

export const ActivitedPriceInput = memo((props: ActivitedPriceInputProps) => {
  const { t } = useTranslation();
  const { symbolInfo, setOrderValue, getErrorMsg } = useEditSheetContext();
  const { quote, quote_dp } = symbolInfo;

  const error = getErrorMsg("activated_price");

  return (
    <Input.tooltip
      prefix={
        <Text intensity={54} className="oui-px-3">
          {t("common.trigger")}
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
      onValueChange={(val) => setOrderValue("activated_price", val)}
      tooltip={error}
      tooltipProps={{
        content: {
          className: "oui-bg-base-5 oui-max-w-[360px]",
        },
        arrow: {
          className: "oui-fill-base-5",
        },
      }}
      classNames={{
        input: "oui-text-base-contrast",
        root: cn("oui-outline-line-12", error && "oui-outline-danger"),
      }}
    />
  );
});

ActivitedPriceInput.displayName = "ActivitedPriceInput";
