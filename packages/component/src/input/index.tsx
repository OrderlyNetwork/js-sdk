import React, { FC, InputHTMLAttributes } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { twMerge } from "tailwind-merge";

const inputVariants = cva(["rounded"], {
  variants: {
    size: {
      small: "h-[28px]",
      default: "h-[40px]",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface InputProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix">,
    VariantProps<typeof inputVariants> {
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;

  // disabled?: boolean;
}

export const Input: FC<InputProps> = ({
  className,
  size,
  disabled,
  prefix,
  suffix,
  ...props
}) => {
  return (
    <div
      className={twMerge(
        "flex flex-row items-center bg-slate-300 rounded focus-within:outline outline-red-400",
        inputVariants({
          size,
          // disabled,
          className,
        })
      )}
    >
      {prefix}
      <input
        type="text"
        className="bg-transparent p-3 flex-1 focus-visible:outline-none min-w-0"
      />
      {suffix}
    </div>
  );
};
