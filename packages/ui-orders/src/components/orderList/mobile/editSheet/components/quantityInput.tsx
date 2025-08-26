import { memo } from "react";
import { utils } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { cn, Input, inputFormatter, Text } from "@orderly.network/ui";
import { useEditSheetContext } from "./editSheetContext";

type QuantityInputProps = {
  value: string | number;
};

export const QuantityInput = memo((props: QuantityInputProps) => {
  const { t } = useTranslation();
  const { symbolInfo, setOrderValue, getErrorMsg } = useEditSheetContext();

  const { base_dp, base_tick, base } = symbolInfo;

  const error = getErrorMsg("order_quantity");

  const setQuantity = (val: string) => {
    setOrderValue("order_quantity", val);
  };

  const onBlur = (value: string) => {
    if (base_tick && base_tick > 0) {
      const formatQty = utils.formatNumber(value, base_tick) ?? value;
      setQuantity(formatQty);
    }
  };

  return (
    <Input.tooltip
      prefix={
        <Text intensity={54} className="oui-px-3">
          {t("common.quantity")}
        </Text>
      }
      suffix={
        <Text intensity={54} className="oui-px-3">
          {base}
        </Text>
      }
      color={error ? "danger" : undefined}
      align="right"
      fullWidth
      autoComplete="off"
      formatters={[
        inputFormatter.numberFormatter,
        inputFormatter.dpFormatter(base_dp),
        // inputFormatter.rangeFormatter({ max: props.maxQty }),
      ]}
      value={props.value}
      onValueChange={setQuantity}
      onBlur={(event) => onBlur(event.target.value)}
      tooltip={error}
      tooltipProps={{
        content: {
          className: "oui-bg-base-6",
        },
        arrow: {
          className: "oui-fill-base-6",
        },
      }}
      classNames={{
        input: "oui-text-base-contrast",
        root: cn("oui-outline-line-12", error && "oui-outline-danger"),
      }}
    />
  );
});

QuantityInput.displayName = "QuantityInput";
