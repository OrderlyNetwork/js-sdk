import { InputFormatter, InputFormatterOptions } from "./inputFormatter";

export const numberFormatter: InputFormatter = {
  onRenderBefore: function (
    value: string | number,
    options: InputFormatterOptions
  ): string {
    return "" + value;
  },
  onSendBefore: function (
    value: string,
    options: InputFormatterOptions
  ): string {
    if (value.startsWith(".")) return `0${value}`;

    value = value
      .replace(/[^\d.]/g, "")
      .replace(".", "$#$")
      .replace(/\./g, "")
      .replace("$#$", ".");

    return value;
  },
};
