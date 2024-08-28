import React, {
  FC,
  InputHTMLAttributes,
  forwardRef,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/css";
import { InputMask } from "./inputMask";
import { Tooltip } from "@/tooltip";
import { CircleCloseIcon } from "@/icon";
import { findLongestCommonSubString } from "@/utils/string";
import { parseInputHelper } from "./utils";

const inputVariants = cva(["orderly-rounded"], {
  variants: {
    variant: {
      outlined: "orderly-border orderly-border-slate-300",
      filled: "orderly-bg-base-700 orderly-border orderly-border-transparent",
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
  onValueChange?: (value: any) => void;
  /**
   * Whether to display the thousandth symbol
   */
  thousandSeparator?: boolean;
  tooltipClassName?: string;
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
      onChange,
      onValueChange,
      thousandSeparator,
      fixClassName,
      id,
      ...props
    },
    ref
  ) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [cursor, setCursor] = useState<number | null>(null);
    const innerInputRef = useRef<HTMLInputElement>(null);
    const prevInputValue = useRef<string | null>(null);
    const cid = useId();

    useEffect(() => {
      if (!ref) return;
      if (typeof ref === "function") {
        ref(innerInputRef.current);
      } else {
        ref.current = innerInputRef.current;
      }
    }, [innerInputRef, ref]);

    useEffect(() => {
      if (typeof error === "undefined") {
        return;
      }
      setShowTooltip(!!error);
    }, [error]);

    // fix cursor pointer jump to end;
    useEffect(() => {
      if (document.activeElement !== innerInputRef.current) return;
      // filter the thousands separator
      const nextValueLen = `${props.value}`.length;
      const prevValueLen = prevInputValue.current?.length || 0;

      const next = cursor ? cursor + (nextValueLen - prevValueLen) : 0;
      innerInputRef.current?.setSelectionRange(next, next);
    }, [props.value]);

    const onInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.target.value.length < (props.value as string)?.length) {
        const currentCursor = event.target.selectionStart;
        const diffIndex = findLongestCommonSubString(
          `${props.value}`,
          event.target.value
        );

        if (diffIndex > -1) {
          const diffStr = `${props.value}`.at(diffIndex);
          if (diffStr === ",") {
            event.target.value = `${event.target.value.substring(
              0,
              diffIndex - 1
            )}${event.target.value.substring(diffIndex)}`;

            event.target.selectionStart = currentCursor ? currentCursor - 1 : 0;
          }
        }
      }

      if (typeof onChange === "function") {
        onChange(event);
      }

      if (typeof onValueChange === "function") {
        let value = event.target.value;

        if (thousandSeparator) {
          value = parseInputHelper(value);
        }

        onValueChange(value);
      }
      prevInputValue.current = event.target.value;
      setCursor(event.target.selectionStart);
    };

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
              "orderly-inline-flex orderly-rounded-full orderly-w-[20px] orderly-h-[20px] orderly-items-center orderly-justify-center"
            }
          >
            <CircleCloseIcon size={16} />
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
        return (
          <InputMask
            name={id || cid}
            className={cn(
              "orderly-text-3xs orderly-select-none orderly-text-base-contrast-54 orderly-font-semibold desktop:orderly-text-2xs",
              fixClassName
            )}
          >
            {prefix}
          </InputMask>
        );
      }

      return prefix;
    }, [prefix, fixClassName]);

    const suffixElement = useMemo(() => {
      if (typeof suffix === "undefined") {
        return null;
      }

      if (typeof suffix === "string") {
        return (
          <InputMask
            name={id || cid}
            className={cn(
              "orderly-text-3xs orderly-select-none orderly-text-base-contrast-54 orderly-font-semibold desktop:orderly-text-xs",
              fixClassName
            )}
          >
            {suffix}
          </InputMask>
        );
      }

      return suffix;
    }, [suffix, fixClassName]);

    return (
      <Tooltip
        className={cn(
          "orderly-text-base-contrast orderly-text-4xs",
          props.tooltipClassName
        )}
        open={showTooltip}
        content={helpText ?? "input help text"}
        sideOffset={5}
      >
        <div
          className={cn(
            "orderly-input-container",
            props.readOnly && "orderly-input-container-readonly",
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
            ref={innerInputRef}
            type="text"
            onFocus={onInputFocus}
            onBlur={onInputBlur}
            onChange={onInputChange}
            {...(props as any)}
            id={id || cid}
            disabled={disabled}
            className={cn(
              "orderly-input",
              "orderly-bg-transparent orderly-px-3 orderly-flex-1 focus-visible:orderly-outline-none orderly-h-full orderly-w-full orderly-peer placeholder:orderly-text-base-contrast-20 placeholder:orderly-text-xs orderly-tabular-nums",
              typeof prefix !== "undefined" && "orderly-px-0",
              className
            )}
          />
          {cleanButton}
          {suffixElement}
        </div>
      </Tooltip>
    );
  }
);
