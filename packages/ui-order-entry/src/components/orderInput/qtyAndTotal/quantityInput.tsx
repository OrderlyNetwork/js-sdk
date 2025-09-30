import { FC, memo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { inputFormatter } from "@orderly.network/ui";
import { InputType } from "../../../types";
import { CustomInput } from "../../customInput";
import { useOrderEntryContext } from "../../orderEntryContext";

type QuantityInputProps = {
  order_quantity?: string;
};

export const QuantityInput: FC<QuantityInputProps> = memo((props) => {
  const { t } = useTranslation();

  const { symbolInfo, onFocus, onBlur, getErrorMsg, setOrderValue } =
    useOrderEntryContext();

  const { base, base_dp } = symbolInfo;

  return (
    <CustomInput
      id="order_quantity_input"
      name="order_quantity_input"
      label={t("common.qty")}
      suffix={base}
      error={getErrorMsg("order_quantity")}
      value={props.order_quantity}
      onChange={(e) => {
        setOrderValue("order_quantity", e);
      }}
      formatters={[inputFormatter.dpFormatter(base_dp)]}
      onFocus={onFocus(InputType.QUANTITY)}
      onBlur={onBlur(InputType.QUANTITY)}
      className="!oui-rounded-r"
      classNames={{
        suffix: "oui-justify-end",
      }}
    />
  );
});

QuantityInput.displayName = "QuantityInput";
