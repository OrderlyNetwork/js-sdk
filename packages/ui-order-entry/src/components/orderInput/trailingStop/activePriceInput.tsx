import { memo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { inputFormatter } from "@orderly.network/ui";
import { InputType } from "../../../types";
import { CustomInput } from "../../customInput";
import { useOrderEntryContext } from "../../orderEntryContext";

type ActivePriceInputProps = {
  activated_price?: string;
  activatedPriceInputRef: React.RefObject<HTMLInputElement>;
};

export const ActivePriceInput = memo<ActivePriceInputProps>((props) => {
  const { t } = useTranslation();
  const { symbolInfo, onFocus, onBlur, getErrorMsg, setOrderValue } =
    useOrderEntryContext();

  return (
    <div className="oui-group">
      <CustomInput
        ref={props.activatedPriceInputRef}
        id="order_activated_price_input"
        name="order_activated_price_input"
        label={t("orderEntry.activationPrice")}
        placeholder={`0 (${t("common.optional")})`}
        suffix={symbolInfo.quote}
        error={getErrorMsg("activated_price")}
        value={props.activated_price}
        onChange={(val: string) => {
          setOrderValue("activated_price", val);
        }}
        formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
        onFocus={onFocus(InputType.ACTIVATED_PRICE)}
        onBlur={onBlur(InputType.ACTIVATED_PRICE)}
      />
    </div>
  );
});

ActivePriceInput.displayName = "ActivePriceInput";
