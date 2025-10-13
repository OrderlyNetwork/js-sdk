import { FC, memo } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { inputFormatter } from "@kodiak-finance/orderly-ui";
import { InputType } from "../../../types";
import { CustomInput } from "../../customInput";
import { useOrderEntryContext } from "../../orderEntryContext";

type TriggerPriceInputProps = {
  trigger_price?: string;
};

export const TriggerPriceInput: FC<TriggerPriceInputProps> = memo((props) => {
  const { t } = useTranslation();
  const {
    symbolInfo,
    onFocus,
    onBlur,
    getErrorMsg,
    setOrderValue,
    triggerPriceInputRef,
  } = useOrderEntryContext();

  return (
    <div className="oui-group">
      <div className="oui-group">
        <CustomInput
          ref={triggerPriceInputRef}
          id="order_trigger_price_input"
          name="order_trigger_price_input"
          label={t("common.trigger")}
          suffix={symbolInfo.quote}
          value={props.trigger_price}
          onChange={(e) => {
            setOrderValue("trigger_price", e);
          }}
          error={getErrorMsg("trigger_price")}
          formatters={[inputFormatter.dpFormatter(symbolInfo.quote_dp)]}
          onFocus={onFocus(InputType.TRIGGER_PRICE)}
          onBlur={onBlur(InputType.TRIGGER_PRICE)}
        />
      </div>
    </div>
  );
});

TriggerPriceInput.displayName = "TriggerPriceInput";
