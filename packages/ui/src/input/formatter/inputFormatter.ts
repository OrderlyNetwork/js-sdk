export type InputFormatterOptions = {
  dp: number;
};

export interface InputFormatter {
  onRenderBefore: (
    value: string | number,
    options: InputFormatterOptions
  ) => string;
  onSendBefore: (value: string, options: InputFormatterOptions) => string;
}
