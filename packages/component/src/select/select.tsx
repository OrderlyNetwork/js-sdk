import { cva, VariantProps, cx } from "class-variance-authority";
import { FC, SelectHTMLAttributes, useMemo, useState } from "react";
import { twMerge } from "tailwind-merge";
import { TriangleDownIcon } from "@radix-ui/react-icons";
import { ActionSheet } from "@/bottomSheet/actionSheet/actionSheet";

export type SelectOption = {
  value: string;
  label: string;
};

const selectVariants = cva(["rounded-md transition-colors"], {
  variants: {
    size: {
      small: "px-1 h-[28px]",
      default: "px-2 py-1 h-[40px]",
      large: "px-6 py-3",
    },
    fullWidth: {
      true: "w-full",
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
      "disabled" | "size" | "onChange"
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

const Select: FC<SelectProps> = ({ className, size, disabled, ...props }) => {
  const [open, setOpen] = useState(false);

  const value = useMemo(() => {
    return props.value || props.label || props.placeholder;
  }, [props.value]);

  const options = useMemo<any[]>(() => {
    return props.options || [];
  }, [props]);

  return (
    <>
      <div
        className={twMerge(
          "flex flex-row items-center bg-slate-300 rounded focus-within:outline outline-red-400",
          selectVariants({
            size,
            disabled: disabled || options.length === 0,
            className,
          }),
          cx(open && "bg-slate-400")
        )}
        onClick={() => {
          if (options.length === 0) return;
          setOpen(!open);
        }}
      >
        <div className="flex-1 px-2">
          {typeof value !== "undefined" && <>{value}</>}
        </div>

        <TriangleDownIcon />
      </div>
      <ActionSheet
        actionSheets={options}
        isOpen={open}
        onValueChange={(value) => {
          // console.log(value);
          props.onChange?.(value);
        }}
        value={props.value}
        onClose={() => setOpen(false)}
      />
    </>
  );
};

export { Select, selectVariants };
