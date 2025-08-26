import { memo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Input, inputFormatter, Text } from "@orderly.network/ui";
import { useEditSheetContext } from "./editSheetContext";

type PriceInputProps = {
  value?: string | number;
  disabled?: boolean;
};

export const PriceInput = memo((props: PriceInputProps) => {
  const { t } = useTranslation();
  const { symbolInfo, setOrderValue, getErrorMsg } = useEditSheetContext();
  const { quote, quote_dp } = symbolInfo;

  const error = getErrorMsg("order_price");

  return (
    <Input.tooltip
      prefix={
        <Text intensity={54} className="oui-px-3">
          {t("common.price")}
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
      disabled={props.disabled}
      value={props.value}
      onValueChange={(val) => setOrderValue("order_price", val)}
      tooltip={error}
      tooltipProps={{
        content: {
          className: "oui-bg-base-5",
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

PriceInput.displayName = "PriceInput";
