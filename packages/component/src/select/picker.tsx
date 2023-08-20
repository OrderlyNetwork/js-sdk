import { forwardRef, SelectHTMLAttributes, useMemo, useState } from "react";
import { cva, cx, VariantProps } from "class-variance-authority";
import { ChevronDown } from "lucide-react";
import { SelectOption } from "@/select/select";
import { cn } from "@/utils/css";
import { ActionSheet } from "@/sheet";

const pickerVariants = cva(
  "flex flex-row items-stretch rounded focus-within:outline outline-primary bg-fill text-base-contrast/50",
  {
    variants: {
      size: {
        small: "px-2 h-[28px]",
        default: "px-3 h-[40px]",
        large: "px-6 py-3",
      },
      fullWidth: {
        true: "w-full",
      },
      disabled: {
        true: "opacity-50 cursor-not-allowed",
      },
      color: {
        // primary: "text-primary",
        default: "text-base-contract",
        buy: "text-trade-profit",
        sell: "text-trade-loss",
      },
    },
    defaultVariants: {
      size: "default",
      color: "default",
    },
  }
);

export interface PickerProps
  extends Omit<
      SelectHTMLAttributes<HTMLSelectElement>,
      "disabled" | "size" | "color"
    >,
    VariantProps<typeof pickerVariants> {
  loading?: boolean;
  label?: string;
  options: SelectOption[];
  onValueChange?: (value: string) => void;
}

export type PickerRef = {};
export const Picker = forwardRef<PickerRef, PickerProps>(
  (
    {
      size,
      color,
      value,
      label,
      placeholder,
      className,
      options,
      fullWidth,
      disabled,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = useState(false);

    const text = useMemo(() => {
      return value || label || placeholder;
    }, [value, label, placeholder]);

    return (
      <ActionSheet
        actionSheets={options}
        onOpenChange={setOpen}
        open={open}
        onClose={() => setOpen(false)}
      >
        <div
          className={cn(
            pickerVariants({
              size,
              color,
              fullWidth,
              disabled: disabled || options.length === 0,
              className,
            })
          )}
        >
          <div className="flex-1 flex justify-start items-center text-inherit">
            {text}
          </div>
          <div className={"flex items-center"}>
            <ChevronDown size={16} className={"text-inherit"} />
          </div>
        </div>
      </ActionSheet>
    );
  }
);
