import { forwardRef, SelectHTMLAttributes, useMemo, useState } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { SelectOption } from "@/select/select";
import { cn } from "@/utils/css";
import { ActionSheet, ActionSheetItem } from "@/sheet";
import { ArrowIcon } from "@/icon";

const pickerVariants = cva(
  "flex flex-row items-stretch rounded focus-within:outline outline-primary bg-fill text-base-contrast/50",
  {
    variants: {
      size: {
        small: "px-2 h-[26px] text-3xs",
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
      "disabled" | "size" | "color" | "value"
    >,
    VariantProps<typeof pickerVariants> {
  loading?: boolean;
  label?: string;
  options: SelectOption[];
  value?: SelectOption | string | number;
  onValueChange?: (value: any) => void;
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

    const selectedItem = useMemo<SelectOption | undefined>(() => {
      if (value && !!(value as SelectOption).value) {
        return value as SelectOption;
      }

      if (typeof value === "number" || typeof value === "string") {
        const option = options.find((option) => option.value === value);
        if (option) {
          return option;
        }
      }
    }, [value, options]);

    const text = useMemo(() => {
      if (selectedItem) {
        return selectedItem.label;
      }
      return placeholder || label || "";
    }, [selectedItem, label, placeholder]);

    const actions: ActionSheetItem[] = useMemo(() => {
      return [...options, "---", "Cancel"];
    }, [options]);

    return (
      <ActionSheet
        actionSheets={actions}
        onOpenChange={setOpen}
        open={open}
        onClose={() => setOpen(false)}
        value={selectedItem}
        onValueChange={props.onValueChange}
      >
        <div
          className={cn(
            "space-x-1 text-base-contrast/80",
            pickerVariants({
              size,
              color,
              fullWidth,
              disabled: disabled || options.length === 0,
              className,
            })
          )}
        >
          <div className="orderly-flex-1 orderly-flex orderly-justify-start orderly-items-center orderly-text-inherit orderly-">
            {text}
          </div>
          <div className="orderly-flex orderly-items-center">
            <ArrowIcon size={12} className="orderly-text-inherit" />
          </div>
        </div>
      </ActionSheet>
    );
  }
);
