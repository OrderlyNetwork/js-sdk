import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "@/utils/css";
import { cva, VariantProps } from "class-variance-authority";

const dividerVariants = cva(
  [
    "flex items-center min-h-[2px] before:block before:content-[''] before:h-[1px] before:border-b before:border-solid before:w-[50%] before:border-inherit after:block after:content-[''] after:h-[1px] after:border-b after:border-solid after:w-[50%] after:border-inherit whitespace-nowrap",
  ],
  {
    variants: {
      vertical: {
        true: "min-w-[10px] before:w-[1px] before:h-[20px] before:border-r before:border-inherit after:hidden",
      },
      color: {
        // primary: "before:border-primary after:border-primary",
        // secondary: "before:border-secondary after:border-secondary",
        tertiary: "border-divider",
      },
    },
    defaultVariants: {
      color: "tertiary",
    },
  }
);

export interface DividerProps extends VariantProps<typeof dividerVariants> {
  // color?: string;
  margin?: number;
  className?: string;
}

export const Divider: FC<PropsWithChildren<DividerProps>> = (props) => {
  const children = useMemo(() => {
    if (typeof props.children === "undefined") return null;
    return <div className="px-2">{props.children}</div>;
  }, [props.children]);

  return (
    <div
      className={cn(
        dividerVariants({
          vertical: props.vertical,
          color: props.color,
          className: props.className,
        })
      )}
    >
      {children}
    </div>
  );
};
