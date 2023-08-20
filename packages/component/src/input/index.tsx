import React, { FC, InputHTMLAttributes, useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/css";
import button from "@/button";
import { X } from "lucide-react";
import { InputMask } from "./inputMask";

const inputVariants = cva(["rounded"], {
  variants: {
    variant: {
      outlined: "border border-slate-300",
      filled: "bg-fill",
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
    // readonly:{
    //     true: "opacity-70 cursor-not-allowed"
    // }
  },
  defaultVariants: {
    size: "default",
    variant: "filled",
  },
});

export interface InputProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "size" | "prefix" | "disabled"
    >,
    VariantProps<typeof inputVariants> {
  prefix?: string | React.ReactNode;
  suffix?: React.ReactNode;
  // clearable?: boolean;
  onClean?: () => void;
  fixClassName?: string;
  // disabled?: boolean;
}

export const Input: FC<InputProps> = ({
  className,
  size,
  variant,
  fullWidth,
  disabled,
  prefix,
  suffix,
  onClean,
  ...props
}) => {
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

  const prefixElement = useMemo(() => {
    if (typeof prefix === "undefined") {
      return null;
    }

    if (typeof prefix === "string") {
      return <InputMask className="text-sm">{prefix}</InputMask>;
    }

    return prefix;
  }, [prefix]);

  const suffixElement = useMemo(() => {
    if (typeof suffix === "undefined") {
      return null;
    }

    if (typeof suffix === "string") {
      return <InputMask className="text-sm">{suffix}</InputMask>;
    }

    return suffix;
  }, [suffix]);

  return (
    <div
      className={cn(
        "flex flex-row items-center rounded focus-within:outline focus-within:outline-1 outline-primary ",
        inputVariants({
          size,
          fullWidth,
          disabled,
          variant,
          // className,
        }),
        props.readOnly && "focus-within:outline-none"
      )}
    >
      {prefixElement}
      <input
        type="text"
        {...props}
        disabled={!!disabled}
        className={cn(
          "bg-transparent p-3 flex-1 focus-visible:outline-none w-full peer",
          typeof prefix !== "undefined" && "px-0",
          className
        )}
      />
      {cleanButton}
      {suffixElement}
    </div>
  );
};
