import { forwardRef, SelectHTMLAttributes, useEffect, useMemo, useRef, useState } from "react";
import { cva, VariantProps } from "class-variance-authority";

import { SelectOption } from "@/select/select";
import { cn } from "@/utils/css";
import { ActionSheet, ActionSheetItem } from "@/sheet";
import { ArrowIcon } from "@/icon";
import { useMediaQuery } from "@orderly.network/hooks";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@radix-ui/react-dropdown-menu";

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
    const isDesktop = useMediaQuery('(min-width: 1024px)');

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

    const triggerRef = useRef(null);
    const [dropdownWidth, setDropdownWidth] = useState(218);

    useEffect(() => {
      if (triggerRef.current) {
        const width = triggerRef.current.offsetWidth;
        setDropdownWidth(width);
      }
    }, []);


    if (!isDesktop) {
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

    return (<DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <div
          ref={triggerRef}
          className={cn(
            "orderly-space-x-1 orderly-text-base-contrast-80",
            pickerVariants({
              size,
              color,
              fullWidth,
              disabled: disabled || options.length === 0,
              className,
            }),
          )}
        >
          <div className="orderly-flex-1 orderly-flex orderly-justify-start orderly-items-center orderly-text-inherit orderly-w-full">
            {text}
          </div>
          <div className="orderly-flex orderly-items-center">
            <ArrowIcon size={12} className="orderly-text-inherit" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="center"
        className="orderly-bg-base-800 orderly-w-[218px] orderly-py-4 orderly-rounded-borderRadius orderly-shadow-[0px_12px_20px_0px_rgba(0,0,0,0.25)] orderly-z-20 orderly-mt-2"
        style={{ width: dropdownWidth }}
      >

        {actions.map((action) => {
          if (typeof action === "string") {
            return (<></>);
          }
          return (<div className="orderly-text-base-contrast-54 hover:orderly-text-base-contrast orderly-bg-base-800 hover:orderly-bg-base-600 orderly-py-2 orderly-px-4">
            <button className="orderly-flex orderly-w-full" onClick={() => {
              setOpen(false);
              props.onValueChange?.(action);
            }}>
              <span>{action.label}</span>

            </button>
          </div>);
        })}

      </DropdownMenuContent>
    </DropdownMenu>);
  }
);
