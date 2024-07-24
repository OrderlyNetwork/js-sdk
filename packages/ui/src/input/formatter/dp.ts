import { InputFormatter, InputFormatterOptions } from "./inputFormatter";
import { Decimal } from "@orderly.network/utils";

export const dpFormatter = (options?: { dp?: number }): InputFormatter => {
  return {
    onRenderBefore: function (
      value: string | number,
      options: InputFormatterOptions
    ): string {
      const d = new Decimal(value);
      d.todp(options.dp);
      return d.toString();
      // return "" + value;
    },
    onSendBefore: function (
      value: string,
      options: InputFormatterOptions
    ): string {
      return value;
    },
  };
};
