import { InputFormatter, InputFormatterOptions } from "./inputFormatter";

type RegexInputFormatter = (regex: RegExp) => InputFormatter;

export const createRegexInputFormatter: RegexInputFormatter = (
  regex: RegExp,
  onSendBefore?: (value: string, options: InputFormatterOptions) => string
) => ({
  onRenderBefore: (
    value: string | number,
    options: InputFormatterOptions
  ): string => {
    const formattedValue = `${value}`.replace(regex, "");
    return formattedValue;
  },
  onSendBefore: (value: string, options: InputFormatterOptions): string => {
    return onSendBefore?.(value, options) || value;
  },
});
