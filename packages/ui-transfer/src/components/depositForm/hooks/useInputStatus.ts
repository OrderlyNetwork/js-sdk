import { useEffect, useState } from "react";
import { useTranslation } from "@kodiak-finance/orderly-i18n";
import { Decimal } from "@kodiak-finance/orderly-utils";
import { InputStatus } from "../../../types";

type Options = { quantity: string; maxQuantity: string | number };

export function useInputStatus(options: Options) {
  const { quantity, maxQuantity } = options;
  const { t } = useTranslation();

  const [inputStatus, setInputStatus] = useState<InputStatus>("default");
  const [hintMessage, setHintMessage] = useState<string>();

  useEffect(() => {
    if (!quantity) {
      // reset input status when value is empty
      setInputStatus("default");
      setHintMessage("");
      return;
    }

    const qty = new Decimal(quantity);

    if (qty.gt(maxQuantity)) {
      setInputStatus("error");
      setHintMessage(t("transfer.insufficientBalance"));
    } else {
      // reset input status
      setInputStatus("default");
      setHintMessage("");
    }
  }, [quantity, maxQuantity]);

  return { inputStatus, hintMessage };
}
