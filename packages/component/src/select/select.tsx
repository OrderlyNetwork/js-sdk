import { cva, VariantProps, cx } from "class-variance-authority";
import { FC, SelectHTMLAttributes, useState } from "react";
import { twMerge } from "tailwind-merge";
import { TriangleDownIcon } from "@radix-ui/react-icons";

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
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "disabled" | "size">,
    VariantProps<typeof selectVariants> {
  /**
   * If `true`, the button will show a loading indicator.
   * @default false
   * */
  loading?: boolean;
  label: string;
  //   className?: string;
}

const Select: FC<SelectProps> = ({ className, size, disabled, ...props }) => {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={twMerge(
        "flex flex-row items-center bg-slate-300 rounded focus-within:outline outline-red-400",
        selectVariants({
          size,
          disabled,
          className,
        }),
        cx(open && "bg-slate-400")
      )}
      onClick={() => setOpen(!open)}
    >
      <div className="flex-1">{props.label}</div>
      <TriangleDownIcon />
    </div>
  );
};

export { Select, selectVariants };
