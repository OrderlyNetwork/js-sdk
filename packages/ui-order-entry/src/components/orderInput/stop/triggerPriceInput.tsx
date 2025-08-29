import { FC, memo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { inputFormatter } from "@orderly.network/ui";
import { InputType } from "../../../types";
import { CustomInput } from "../../customInput";
import { useOrderEntryContext } from "../../orderEntryContext";

type TriggerPriceInputProps = {
  trigger_price?: string;
  triggerPriceInputRef: React.RefObject<HTMLInputElement>;
};

export const TriggerPriceInput: FC<TriggerPriceInputProps> = memo((props) => {
  const { t } = useTranslation();
  const { symbolInfo, onFocus, onBlur, getErrorMsg, setOrderValue } =
    useOrderEntryContext();

  return (
    <div className="oui-group">
      <div className="oui-group">
        <CustomInput
          ref={props.triggerPriceInputRef}
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
