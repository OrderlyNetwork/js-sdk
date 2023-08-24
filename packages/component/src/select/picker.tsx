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
            <ArrowIcon size={12} className={"text-inherit"} />
          </div>
        </div>
      </ActionSheet>
    );
  }
);
