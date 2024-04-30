import React, { type InputHTMLAttributes } from "react";
import { tv, type VariantProps } from "tailwind-variants";

const inputs = tv({
  slots: {
    input: [
      "oui-w-full oui-bg-transparent",
      "oui-bg-transparent",
      "oui-flex-1",
      "focus-visible:oui-outline-none",
      "oui-w-full",
      "oui-peer",
      "placeholder:oui-text-base-contrast-20",
      "placeholder:oui-text-xs",
      "oui-tabular-nums",
      "placeholder:oui-text-base-contrast-20",
      "oui-text-white",
    ],
    box: [
      "oui-rounded",
      "oui-bg-base-6",
      "oui-flex",
      "oui-items-center",
      "oui-outline",
      "oui-outline-offset-0",
      "oui-outline-1",
      "focus-within:oui-outline-primary",
    ],
  },
  variants: {
    size: {
      mini: {
        input: ["oui-h-7", "oui-text-2xs"],
        box: ["oui-h-7 oui-px-3"],
      },
      medium: {
        input: ["oui-h-8", "oui-text-2xs"],
        box: ["oui-h-8 oui-px-3"],
      },
      default: {
        input: ["oui-h-10", "oui-text-sm"],
        box: ["oui-h-10 oui-px-3 oui-rounded-md"],
      },
      large: {
        input: ["oui-h-12", "oui-text-base"],
        box: ["oui-h-12 oui-px-3 oui-rounded-md"],
      },
    },
    color: {
      success: {
        box: ["oui-outline-success"],
      },
      danger: {
        box: ["oui-outline-danger"],
      },
      warning: {
        box: ["oui-outline-warning"],
      },
      default: {
        box: ["oui-outline-transparent"],
      },
    },
    disabled: {
      true: {
        input: ["oui-cursor-not-allowed", "oui-text-base-contrast-20"],
        box: ["oui-bg-base-8"],
      },
    },
  },
  //   compoundVariants: [{ size: "default", className: ["oui-bg-transparent"] }],
  defaultVariants: {
    size: "default",
  },
});

interface InputProps<T = string>
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "size" | "prefix" | "disabled" | "inputMode" | "color"
    >,
    VariantProps<typeof inputs> {
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  clearable?: boolean;
  onClean?: () => void;
  fixClassName?: string;
  helpText?: string;
  loading?: boolean;
  inputMode?: "decimal" | "numeric" | "amount";
  containerClassName?: string;
  onValueChange?: (value: T) => void;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    size,
    disabled,
    color,
    prefix,
    suffix,
    clearable,
    onClean,
    fixClassName,
    helpText,
    loading,
    inputMode,
    containerClassName,
    onValueChange,
    ...inputProps
  } = props;

  const { input, box } = inputs({ size, disabled, color });
  return (
    <div className={box()}>
      <input
        {...inputProps}
        disabled={disabled}
        ref={ref}
        className={input()}
      />
    </div>
  );
});

export { Input, inputs };

export type { InputProps };
