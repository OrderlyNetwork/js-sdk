import { FC, memo, useEffect, useState } from "react";
import { useLocalStorage } from "@veltodefi/hooks";
import { useTranslation } from "@veltodefi/i18n";
import { inputFormatter } from "@veltodefi/ui";
import { Decimal } from "@veltodefi/utils";
import { InputType } from "../../../types";
import { CustomInput } from "../../customInput";
import { useOrderEntryContext } from "../../orderEntryContext";
import { OrderTotalType, TotalTypeSelect } from "./totalTypeSelect";

type TotalInputProps = {
  total?: string;
};

/**
 * order size = order size (notional) = quantity * price
 * Initial margin = order size / leverage = quantity * price / leverage
 * Order size = Initial margin * leverage = quantity * price
 */
export const TotalInput: FC<TotalInputProps> = memo((props) => {
  const { t } = useTranslation();
  const { total } = props;

  const [margin, setMargin] = useState("");

  const {
    symbolInfo,
    onFocus,
    onBlur,
    getErrorMsg,
    setOrderValue,
    leverage = 1,
    currentFocusInput,
  } = useOrderEntryContext();

  const { quote } = symbolInfo;

  const [totalType, setTotalType] = useLocalStorage<OrderTotalType>(
    "orderly_order_total_type",
    OrderTotalType.OrderSize,
  );

  useEffect(() => {
    if (total) {
      if (currentFocusInput !== InputType.MARGIN) {
        const margin = new Decimal(total).div(leverage).todp(2).toString();
        setMargin(margin);
      }
    } else {
      setMargin("");
    }
  }, [total, leverage, currentFocusInput]);

  const onMarginChange = (val: string) => {
    const total = val ? new Decimal(val).mul(leverage).toString() : "";
    setOrderValue("total", total);
    setMargin(val);
  };

  const prefix = <TotalTypeSelect value={totalType} onChange={setTotalType} />;

  if (totalType === OrderTotalType.InitialMargin) {
    return (
      <CustomInput
        id="order_margin_input"
        name="order_margin_input"
        label={`${t("orderEntry.initialMargin")}≈`}
        prefix={prefix}
        suffix={quote}
        error={getErrorMsg("total") ? "initial margin error" : ""}
        value={margin}
        onChange={onMarginChange}
        // national precision is 2
        formatters={[inputFormatter.dpFormatter(2)]}
        onFocus={onFocus(InputType.MARGIN)}
        onBlur={onBlur(InputType.MARGIN)}
        className="!oui-rounded-l"
        classNames={{
          suffix: "oui-justify-end",
        }}
      />
    );
  }

  return (
    <CustomInput
      id="order_total_input"
      name="order_total_input"
      label={`${t("orderEntry.orderSize")}≈`}
      prefix={prefix}
      suffix={quote}
      error={getErrorMsg("total")}
      value={props.total}
      onChange={(val) => {
        setOrderValue("total", val);
      }}
      className="!oui-rounded-l"
      classNames={{
        suffix: "oui-justify-end",
      }}
      // national precision is 2
      formatters={[inputFormatter.dpFormatter(2)]}
      onFocus={onFocus(InputType.TOTAL)}
      onBlur={onBlur(InputType.TOTAL)}
    />
  );
});

TotalInput.displayName = "TotalInput";
