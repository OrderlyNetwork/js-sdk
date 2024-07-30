import { InputFormatterOptions } from "./inputFormatter";
import { Decimal } from "@orderly.network/utils";

export const dpFormatter = (
  dp: number,
  config?: {
    /**
     * The rounding mode to use when rounding the number
     * @default Decimal.ROUND_DOWN
     */
    roundingMode?: number;
  }
) => {
  const onBefore = (value: string | number, options: InputFormatterOptions) => {
    if (typeof value === "number") value = value.toString();
    if (!value || value.endsWith(".")) return value;
    const { roundingMode = Decimal.ROUND_DOWN } = config ?? {};
    let d = new Decimal(value);
    d = d.todp(dp, roundingMode);
    return d.toString();
  };

  return {
    onRenderBefore: onBefore,
    onSendBefore: onBefore,
  };
};
