import { cva, VariantProps, cx } from "class-variance-authority";
import {
  FC,
  SelectHTMLAttributes,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useId,
} from "react";

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
  value: string | number;
  label: string;
};

const selectVariants = cva(["orderly-rounded orderly-transition-colors orderly-bg-fill"], {
  variants: {
    size: {
      small: "orderly-px-2 orderly-h-[28px]",
      default: "orderly-px-2 orderly-py-1 orderly-h-[40px]",
      large: "orderly-px-6 orderly-py-3",
    },
    fullWidth: {
      true: "orderly-w-full",
    },
    color: {
      // primary: "text-primary",
      default: "orderly-text-base-contract",
      buy: "orderly-text-trade-profit",
      sell: "orderly-text-trade-loss",
    },
    disabled: {
      true: "orderly-opacity-50 orderly-cursor-not-allowed",
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
  // const uid = useId();

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

  const triggerRef = React.useRef<HTMLDivElement | null>(null);
  // const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (triggerRef.current) {
      setWidth(triggerRef.current.offsetWidth);
    }
  }, []);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen} modal={false}>
      <DropdownMenuTrigger asChild>
        <div
          ref={triggerRef}
          className={cn(
            "orderly-flex orderly-flex-row orderly-items-center orderly-rounded focus-within:orderly-outline orderly-space-x-1",
            selectVariants({
              size,
              disabled: disabled || options.length === 0,
              className,
              color,
            }),
            open && "bg-popover"
          )}
          // onClick={() => {
          //   if (options.length === 0) return;
          //   setOpen(!open);
          // }}
        >
          <div className="orderly-flex-1 orderly-text-3xs orderly-text-inherit">
            {typeof label !== "undefined" && <>{label}</>}
          </div>

          <ArrowIcon
            size={12}
            className={cx("orderly-transition-transform", open && "orderly-rotate-180")}
          />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        container={containerRef.current}
        align="start"
        style={{ width: `${width}px` }}
        // onPointerDownOutside={(event) => {
        //
        // }}
        // onInteractOutside={() => setOpen(false)}
      >
        {props.options?.map((option, index) => {
          return (
            <DropdownMenuItem
              textValue={option.value}
              key={index}
              className={cn(
                "orderly-text-base-contrast/60",
                option.value === props.value &&
                  (color === "buy" ? "orderly-text-trade-profit" : "orderly-text-trade-loss")
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
