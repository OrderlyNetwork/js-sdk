import React, { type InputHTMLAttributes, useId } from "react";
import { tv, type VariantProps } from "tailwind-variants";
import { BaseInput, BaseInputProps } from "./baseInput";
import { InputPrefix } from "./prefix";
import { InputSuffix } from "./suffix";

const inputs = tv({
  slots: {
    input: [
      "oui-w-full oui-bg-transparent",
      "oui-bg-transparent",
      "oui-flex-1",
      "focus-visible:oui-outline-none",
      "oui-flex",
      "oui-peer",
      "placeholder:oui-text-base-contrast-20",
      "placeholder:oui-text-xs",
      "oui-tabular-nums",
      "placeholder:oui-text-base-contrast-20",
      "oui-text-white",
      "autofill:oui-bg-transparent",
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
    additional: [
      "oui-h-full oui-flex oui-flex-col oui-justify-center oui-px-3 oui-text-base-contrast/60",
    ],
  },
  variants: {
    size: {
      mini: {
        input: ["oui-h-7", "oui-text-2xs"],
        box: ["oui-h-7"],
        additional: ["oui-text-2xs"],
      },
      medium: {
        input: ["oui-h-8", "oui-text-2xs"],
        box: ["oui-h-8"],
        additional: ["oui-text-sm"],
      },
      default: {
        input: ["oui-h-10", "oui-text-sm"],
        box: ["oui-h-10 oui-rounded-md"],
        additional: ["oui-text-sm"],
      },
      large: {
        input: ["oui-h-12", "oui-text-base"],
        box: ["oui-h-12 oui-rounded-md"],
        additional: ["oui-text-sm"],
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
    pl: {
      true: {
        box: "oui-pl-3",
      },
      false: {
        box: "oui-pl-0",
      },
    },
    pr: {
      true: {
        box: "oui-pr-3",
      },
      false: {
        box: "oui-pr-0",
      },
    },
    fullWidth: {
      true: {
        box: "oui-w-full",
      },
    },
  },
  //   compoundVariants: [{ size: "default", className: ["oui-bg-transparent"] }],
  defaultVariants: {
    size: "default",
  },
});

interface InputProps<T = string>
  extends BaseInputProps<T>,
    VariantProps<typeof inputs> {
  prefix?: string | React.ReactNode;
  suffix?: string | React.ReactNode;
  fullWidth?: boolean;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  const {
    size,
    disabled,
    color,
    suffix,
    prefix,
    id,
    pl,
    pr,
    fullWidth,
    className,
    ...inputProps
  } = props;

  console.log(props);

  const { input, box, additional } = inputs({
    size,
    disabled,
    color,
    fullWidth,
    className,
    pl: typeof prefix === "undefined" || pl,
    pr: typeof suffix === "undefined" || pr,
  });
  const cid = useId();
  return (
    <div className={box()}>
      <InputPrefix id={id || cid} prefix={prefix} className={additional()} />
      <BaseInput
        {...inputProps}
        id={id || cid}
        disabled={disabled}
        ref={ref}
        className={input()}
      />
      <InputSuffix id={id || cid} suffix={suffix} className={additional()} />
    </div>
  );
});

export { Input, inputs };

export type { InputProps };
