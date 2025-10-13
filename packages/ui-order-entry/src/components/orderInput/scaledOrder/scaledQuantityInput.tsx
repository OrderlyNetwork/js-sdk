import { memo } from "react";
import { useLocalStorage } from "@kodiak-finance/orderly-hooks";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { inputFormatter } from "@kodiak-finance/orderly-ui";
import { InputType } from "../../../types";
import { CustomInput } from "../../customInput";
import { useOrderEntryContext } from "../../orderEntryContext";
import { ScaledQuantityUnit } from "./scaledQuantityUnit";

type ScaledQuantityInputProps = {
  order_quantity?: string;
  total?: string;
};

export const ScaledQuantityInput = memo((props: ScaledQuantityInputProps) => {
  const { t } = useTranslation();
  const { errors, symbolInfo, onFocus, onBlur, getErrorMsg, setOrderValue } =
    useOrderEntryContext();

  const [quantityUnit, setQuantityUnit] = useLocalStorage<"quote" | "base">(
    "orderly_order_quantity_unit",
    "quote",
  );

  const { base, quote, base_dp, quote_dp } = symbolInfo;

  const isBase = quantityUnit === "base";
  const unit = isBase ? base : quote;

  const suffix = (
    <ScaledQuantityUnit
      base={base}
      quote={quote}
      value={unit}
      onValueChange={(value) => {
        setQuantityUnit(value === base ? "base" : "quote");
      }}
    />
  );

  if (isBase) {
    return (
      <CustomInput
        label={t("common.qty")}
        suffix={suffix}
        id="order_quantity_input"
        name="order_quantity_input"
        className="!oui-rounded-r"
        value={props.order_quantity}
        error={getErrorMsg(
          "order_quantity",
          `${errors?.order_quantity?.value} ${base}`,
        )}
        onChange={(val) => {
          setOrderValue("order_quantity", val);
        }}
        formatters={[inputFormatter.dpFormatter(base_dp)]}
        onFocus={onFocus(InputType.QUANTITY)}
        onBlur={onBlur(InputType.QUANTITY)}
      />
    );
  }

  return (
    <CustomInput
      label={t("common.qty")}
      suffix={suffix}
      id="order_total_input"
      name="order_total_input"
      className="!oui-rounded-r"
      value={props.total}
      error={getErrorMsg("order_quantity", `${errors?.total?.value} ${quote}`)}
      onChange={(val) => {
        setOrderValue("total", val);
      }}
      formatters={[inputFormatter.dpFormatter(quote_dp)]}
      onFocus={onFocus(InputType.TOTAL)}
      onBlur={onBlur(InputType.TOTAL)}
    />
  );
});
