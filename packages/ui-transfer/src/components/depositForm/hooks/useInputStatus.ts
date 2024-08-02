import { Decimal } from "@orderly.network/utils";
import { useEffect, useState } from "react";
import { InputStatus } from "../../../types";

type Options = { quantity: string; maxQuantity: string };

export function useInputStatus(options: Options) {
  const { quantity, maxQuantity } = options;

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
      setHintMessage("Insufficient balance");
    } else {
      // reset input status
      setInputStatus("default");
      setHintMessage("");
    }
  }, [quantity, maxQuantity]);

  return { inputStatus, hintMessage };
}
