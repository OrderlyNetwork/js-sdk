import { useMemo } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { Decimal } from "@orderly.network/utils";
import { InputStatus } from "../../../types";

type Options = { quantity: string; maxQuantity: string | number };

export function useInputStatus(options: Options) {
  const { quantity, maxQuantity } = options;
  const { t } = useTranslation();

  return useMemo(() => {
    if (!quantity) {
      return { inputStatus: "default" as InputStatus, hintMessage: "" };
    }

    const qty = new Decimal(quantity);
    if (qty.gt(maxQuantity)) {
      return {
        inputStatus: "error" as InputStatus,
        hintMessage: t("transfer.insufficientBalance"),
      };
    }

    return { inputStatus: "default" as InputStatus, hintMessage: "" };
  }, [quantity, maxQuantity, t]);
}
