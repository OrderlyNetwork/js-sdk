import React, { FC, InputHTMLAttributes, useMemo } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/utils/css";
import button from "@/button";
import { X } from "lucide-react";

const inputVariants = cva(["rounded"], {
  variants: {
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
  },
});

export interface InputProps
  extends Omit<
      InputHTMLAttributes<HTMLInputElement>,
      "size" | "prefix" | "disabled"
    >,
    VariantProps<typeof inputVariants> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  // clearable?: boolean;
  onClean?: () => void;
  // disabled?: boolean;
}

export const Input: FC<InputProps> = ({
  className,
  size,
  fullWidth,
  disabled,
  prefix,
  suffix,
  ...props
}) => {
  const cleanButton = useMemo(() => {
    if (typeof props.onClean === "undefined") {
      return null;
    }
    return (
      <button
        className={"hidden peer-focus:flex px-3 items-center justify-center"}
        onMouseDown={(event) => {
          event.preventDefault();
          event.stopPropagation();
          props.onClean?.();
        }}
      >
        <span
          className={
            "inline-flex rounded-full bg-black/20 w-[18px] h-[18px] items-center justify-center"
          }
        >
          <X size={12} />
        </span>
      </button>
    );
  }, [props.onClean]);
  return (
    <div
      className={cn(
        "flex flex-row items-center bg-slate-300 rounded focus-within:outline outline-red-400",
        inputVariants({
          size,
          fullWidth,
          disabled,
        })
      )}
    >
      {prefix}
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
      {suffix}
    </div>
  );
};
