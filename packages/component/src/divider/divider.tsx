import { FC, PropsWithChildren, useMemo } from "react";
import { cn } from "@/utils/css";
import { cva, VariantProps } from "class-variance-authority";

const dividerVariants = cva(
  [
    "orderly-flex orderly-items-center orderly-min-h-[2px] before:orderly-block before:orderly-content-[''] before:orderly-h-[1px] before:orderly-border-b before:orderly-border-solid before:orderly-w-[50%] before:orderly-border-inherit after:orderly-block after:orderly-content-[''] after:orderly-h-[1px] after:orderly-border-b after:orderly-border-solid after:orderly-w-[50%] after:orderly-border-inherit orderly-whitespace-nowrap",
  ],
  {
    variants: {
      vertical: {
        true: "orderly-min-w-[10px] before:orderly-w-[1px] before:orderly-h-[20px] before:orderly-border-r before:orderly-border-inherit after:orderly-hidden",
      },
      color: {
        // primary: "before:border-primary after:border-primary",
        // secondary: "before:border-secondary after:border-secondary",
        tertiary: "orderly-border-divider",
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
    return <div className="orderly-px-2">{props.children}</div>;
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
