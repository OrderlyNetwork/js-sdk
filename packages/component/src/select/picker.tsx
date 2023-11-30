import { forwardRef, SelectHTMLAttributes, useMemo, useState } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { SelectOption } from "@/select/select";
import { cn } from "@/utils/css";
import { ActionSheet, ActionSheetItem } from "@/sheet";
import { ArrowIcon } from "@/icon";

const pickerVariants = cva(
  "orderly-flex orderly-flex-row orderly-items-stretch orderly-rounded focus-within:orderly-outline orderly-outline-primary orderly-bg-fill orderly-text-base-contrast/50",
  {
    variants: {
      size: {
        small: "orderly-px-2 orderly-h-[26px] orderly-text-3xs",
        default: "orderly-px-3 orderly-h-[40px]",
        large: "orderly-px-6 orderly-py-3",
      },
      fullWidth: {
        true: "orderly-w-full",
      },
      disabled: {
        true: "orderly-opacity-50 orderly-cursor-not-allowed",
      },
      color: {
        // primary: "text-primary",
        default: "orderly-text-base-contract",
        buy: "orderly-text-trade-profit",
        sell: "orderly-text-trade-loss",
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

    // @ts-ignore
    const actions: ActionSheetItem[] = useMemo(() => {
      return [...options, "---", "Cancel"];
    }, [options]);

    return (
      <ActionSheet
        actionSheets={actions}
        onOpenChange={setOpen}
        open={open}
        onClose={() => setOpen(false)}
        // @ts-ignore
        value={selectedItem}
        onValueChange={props.onValueChange}
      >
        <div
          className={cn(
            "orderly-space-x-1 orderly-text-base-contrast/80",
            pickerVariants({
              size,
              color,
              fullWidth,
              disabled: disabled || options.length === 0,
              className,
            })
          )}
        >
          <div className="orderly-flex-1 orderly-flex orderly-justify-start orderly-items-center orderly-text-inherit">
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
