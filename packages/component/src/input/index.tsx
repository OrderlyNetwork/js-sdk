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

const inputVariants = cva(["rounded"], {
  variants: {
    variant: {
      outlined: "border border-slate-300",
      filled: "bg-fill border border-transparent",
    },
    size: {
      small: "h-[28px]",
      default: "h-[40px]",
    },
    fullWidth: {
      true: "w-full",
    },
    disabled: {
      true: "opacity-70 cursor-not-allowed",
    },
    error: {
      true: "border border-danger",
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
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
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
          className={"hidden peer-focus:flex px-3 items-center justify-center"}
          onMouseDown={(event) => {
            event.preventDefault();
            event.stopPropagation();
            onClean?.();
          }}
        >
          <span
            className={
              "inline-flex rounded-full bg-base-contrast/20 w-[20px] h-[20px] items-center justify-center text-base-100"
            }
          >
            <X size={16} />
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
        return <InputMask className="text-sm select-none">{prefix}</InputMask>;
      }

      return prefix;
    }, [prefix]);

    const suffixElement = useMemo(() => {
      if (typeof suffix === "undefined") {
        return null;
      }

      if (typeof suffix === "string") {
        return <InputMask className="text-sm select-none">{suffix}</InputMask>;
      }

      return suffix;
    }, [suffix]);

    return (
      <Tooltip
        open={showTooltip}
        content={helpText ?? "input help text"}
        sideOffset={5}
      >
        <div
          className={cn(
            "flex flex-row items-center rounded focus-within:outline focus-within:outline-1 outline-primary",
            inputVariants({
              size,
              fullWidth,
              disabled,
              variant,
              error,
              // className,
            }),
            (props.readOnly || !!error) && "focus-within:outline-none"
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
              "bg-transparent px-3 flex-1 focus-visible:outline-none h-full w-full peer placeholder:text-base-contrast/20",
              typeof prefix !== "undefined" && "px-0",
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
