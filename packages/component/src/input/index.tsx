import React, {
  FC,
  InputHTMLAttributes,
  forwardRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/css";
import { X } from "lucide-react";
import { InputMask } from "./inputMask";
import { Tooltip } from "@/tooltip";

const inputVariants = cva(["orderly-rounded"], {
  variants: {
    variant: {
      outlined: "orderly-border orderly-border-slate-300",
      filled: "orderly-bg-fill orderly-border orderly-border-transparent",
    },
    size: {
      small: "orderly-h-[28px]",
      default: "orderly-h-[40px]",
    },
    fullWidth: {
      true: "orderly-w-full",
    },
    disabled: {
      true: "orderly-opacity-70 orderly-cursor-not-allowed",
    },
    error: {
      true: "orderly-border orderly-border-danger",
    },
    // readonly:{
    //     true: "opacity-70 cursor-not-allowed"
    // }
  },
  // compoundVariants: [
  //   {
  //     variant: "filled",
  //     error: true,
  //     class: "border border-danger",
  //   },
  //   {
  //     variant: "outlined",

  //   }
  // ],
  defaultVariants: {
    size: "default",
    variant: "filled",
  },
});

export interface InputProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "size" | "prefix" | "disabled" | "inputMode"
    >,
    VariantProps<typeof inputVariants> {
  prefix?: string | React.ReactNode;
  suffix?: React.ReactNode;
  // clearable?: boolean;
  onClean?: () => void;
  fixClassName?: string;
  helpText?: string;
  loading?: boolean;
  //
  inputMode?: "decimal" | "numeric" | "amount"; // extend input origin inputMode
  // disabled?: boolean;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      containerClassName,
      size,
      variant,
      fullWidth,
      disabled,
      prefix,
      suffix,
      error,
      onClean,
      helpText,
      loading,
      ...props
    },
    ref
  ) => {
    const [showTooltip, setShowTooltip] = useState(false);

    useEffect(() => {
      if (typeof error === "undefined") {
        return;
      }
      setShowTooltip(!!error);
    }, [error]);

    const cleanButton = useMemo(() => {
      if (typeof onClean === "undefined") {
        return null;
      }
      return (
        <button
          className="orderly-hidden peer-focus:orderly-flex orderly-px-3 orderly-items-center orderly-justify-center"
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClean?.();
          }}
        >
          <span
            className={
              "orderly-inline-flex orderly-rounded-full orderly-bg-base-contrast/20 orderly-w-[20px] orderly-h-[20px] orderly-items-center orderly-justify-center orderly-text-base-100"
            }
          >
            <X size={16} className="orderly-text-base-contrast-54" />
          </span>
        </button>
      );
    }, [onClean]);

    const onInputFocus = (event: React.FocusEvent<HTMLInputElement>) => {
      setShowTooltip(!!error);
    };

    const onInputBlur = (event: React.FocusEvent<HTMLInputElement>) => {
      setShowTooltip(false);
    };

    const prefixElement = useMemo(() => {
      if (typeof prefix === "undefined") {
        return null;
      }

      if (typeof prefix === "string") {
        return <InputMask className="orderly-text-3xs orderly-select-none orderly-text-base-contrast-54">{prefix}</InputMask>;
      }

      return prefix;
    }, [prefix]);

    const suffixElement = useMemo(() => {
      if (typeof suffix === "undefined") {
        return null;
      }

      if (typeof suffix === "string") {
        return <InputMask className="orderly-text-3xs orderly-select-none orderly-text-base-contrast-54">{suffix}</InputMask>;
      }

      return suffix;
    }, [suffix]);

    return (
      <Tooltip
        className="orderly-text-base-contrast orderly-text-4xs"
        open={showTooltip}
        content={helpText ?? "input help text"}
        sideOffset={5}
      >
        <div
          className={cn(
            "orderly-flex orderly-flex-row orderly-items-center orderly-rounded focus-within:orderly-outline focus-within:orderly-outline-1 orderly-outline-primary",
            inputVariants({
              size,
              fullWidth,
              disabled,
              variant,
              error,
            }),
            (props.readOnly || !!error) && "focus-within:orderly-outline-none",
            containerClassName
          )}
        >
          {prefixElement}
          <input
            type="text"
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            {...props}
            disabled={!!disabled}
            className={cn(
              "orderly-bg-transparent orderly-px-3 orderly-flex-1 focus-visible:orderly-outline-none orderly-h-full orderly-w-full orderly-peer placeholder:orderly-text-base-contrast-20",
              typeof prefix !== "undefined" && "orderly-px-0",
              className
            )}
            ref={ref}
          />
          {cleanButton}
          {suffixElement}
        </div>
      </Tooltip>
    );
  }
);
