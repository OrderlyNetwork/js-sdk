import { cva, VariantProps, cx } from "class-variance-authority";
import { FC, SelectHTMLAttributes, useEffect, useMemo, useState } from "react";

import { ActionSheet } from "@/sheet/actionSheet/actionSheet";
import { ChevronDown } from "lucide-react";
import { cn } from "@/utils/css";
import { ArrowIcon } from "@/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/dropdown/dropdown";
import React from "react";

export type SelectOption = {
  value: string;
  label: string;
};

const selectVariants = cva(["rounded transition-colors bg-fill"], {
  variants: {
    size: {
      small: "px-2 h-[28px]",
      default: "px-2 py-1 h-[40px]",
      large: "px-6 py-3",
    },
    fullWidth: {
      true: "w-full",
    },
    color: {
      // primary: "text-primary",
      default: "text-base-contract",
      buy: "text-trade-profit",
      sell: "text-trade-loss",
    },
    disabled: {
      true: "opacity-50 cursor-not-allowed",
    },
  },
  defaultVariants: {
    size: "default",
  },
});

export interface SelectProps
  extends Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      "disabled" | "size" | "onChange" | "color"
    >,
    VariantProps<typeof selectVariants> {
  /**
   * If `true`, the button will show a loading indicator.
   * @default false
   * */
  loading?: boolean;
  label?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  //   className?: string;
}

const Select: FC<SelectProps> = ({
  className,
  size,
  disabled,
  color,
  ...props
}) => {
  const [open, setOpen] = useState(false);
  const [width, setWidth] = useState(0);

  const label = useMemo(() => {
    if (typeof props.value !== "undefined") {
      const activeItem = props.options?.find(
        (item) => item.value === props.value
      );

      if (activeItem) return activeItem.label;
    }
    return props.value || props.label || props.placeholder;
  }, [props.value]);

  const options = useMemo<any[]>(() => {
    return props.options || [];
  }, [props]);

  const triggerRef = React.useRef<any>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setWidth(triggerRef.current.offsetWidth);
    }
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          ref={triggerRef}
          className={cn(
            "flex flex-row items-center rounded focus-within:outline space-x-1",
            selectVariants({
              size,
              disabled: disabled || options.length === 0,
              className,
              color,
            }),
            open && "bg-popover"
          )}
          onClick={() => {
            if (options.length === 0) return;
            setOpen(!open);
          }}
        >
          <div className="flex-1 text-sm text-inherit">
            {typeof label !== "undefined" && <>{label}</>}
          </div>

          <ArrowIcon
            size={12}
            className={cx("transition-transform", open && "rotate-180")}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" style={{ width: `${width}px` }}>
        {props.options?.map((option, index) => {
          return (
            <DropdownMenuItem
              textValue={option.value}
              key={index}
              className={cn(
                "text-base-contrast/60",
                option.value === props.value &&
                  (color === "buy" ? "text-trade-profit" : "text-trade-loss")
              )}
              onSelect={(evnet) => {
                props.onChange?.(option.value);
              }}
            >
              {option.label}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { Select, selectVariants };
