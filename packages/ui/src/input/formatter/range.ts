import { InputFormatterOptions } from "./inputFormatter";

export const rangeFormatter = (props: { max?: number; min?: number }) => {
  const onBefore = (value: string | number, options: InputFormatterOptions) => {
    if (typeof value === "number") value = value.toString();
    if (!value || value.endsWith(".")) return value;

    const innerMax = props.max ?? Number(value);
    const innerMin = props.min ?? Number(value);
    const innerValue = Number(value);

    if (isNaN(innerValue)) {
      return "";
    }

    return `${
      innerValue < innerMin
        ? innerMin
        : innerValue > innerMax
          ? innerMax
          : innerValue
    }`;
  };

  return {
    onRenderBefore: onBefore,
    onSendBefore: onBefore,
  };
};
