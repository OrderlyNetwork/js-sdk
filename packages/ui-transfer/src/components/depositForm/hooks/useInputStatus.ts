import { Decimal } from "@orderly.network/utils";
import { useEffect, useState } from "react";
import { InputStatus } from "../../../types";
import { useTranslation } from "@orderly.network/i18n";

type Options = { quantity: string; maxQuantity: string };

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

    const d = new Decimal(quantity);

    if (d.gt(maxQuantity)) {
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
