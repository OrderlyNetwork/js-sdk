export type InputFormatterOptions = {
  dp: number;
};

type InputFormatterFn = () => InputFormatter;

export type InputFormatter = {
  onRenderBefore: (
    value: string | number,
    options: InputFormatterOptions
  ) => string;
  onSendBefore: (value: string, options: InputFormatterOptions) => string;
};
