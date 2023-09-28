import { FC, PropsWithChildren, useEffect, useMemo, useState } from "react";
import { SelectProps, selectVariants } from "./select";
import { cn } from "@/utils/css";
import { ArrowIcon } from "@/icon";
import { cx } from "class-variance-authority";
import React from "react";

export const MSelect: FC<SelectProps> = ({
  className,
  size,
  disabled,
  color,
  fullWidth,
  ...props
}) => {
  const [open, setOpen] = useState(false);

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

  const containerRef = React.useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const onTouchStart = (event: TouchEvent) => {
      if (
        containerRef.current === event.target ||
        containerRef.current?.contains(event.target as Element)
      ) {
        return;
      }
      setOpen(false);
      //   document.removeEventListener("click", onClick);
    };

    const onClick = (event: MouseEvent) => {
      if (
        containerRef.current === event.target ||
        containerRef.current?.contains(event.target as Element)
      ) {
        return;
      }
      //   event.stopPropagation();
      setOpen(false);
    };

    if (open) {
      //   const onTouchMove = () => {};
      setTimeout(() => {
        document.addEventListener("touchstart", onTouchStart, {
          capture: true,
          once: true,
        });

        document.addEventListener("click", onClick, {
          capture: true,
          once: true,
        });
      }, 100);

      return () => {
        // console.log("======= remove eventlistener");
        document.removeEventListener("touchstart", onTouchStart);
        document.removeEventListener("click", onClick);
      };
    } else {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("click", onClick);
    }
  }, [open]);

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        disabled={Boolean(disabled)}
        onClick={() => setOpen((open) => !open)}
        className={cn(
          "flex flex-row items-center rounded space-x-1 text-sm",
          selectVariants({
            size,
            disabled: disabled || options.length === 0,
            className,
            color,
            fullWidth,
          }),
          open && "bg-popover"
        )}
      >
        <span className="flex flex-1 text-inherit">
          {typeof label !== "undefined" && <>{label}</>}
        </span>

        <ArrowIcon
          size={12}
          className={cx("transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <div
          data-state={open ? "open" : "closed"}
          className={cn(
            "z-50 min-w-[8rem] overflow-hidden rounded-md bg-popover p-1 text-popover-foreground shadow-md py-2 absolute left-0 top-full mt-1 w-full space-y-1",
            "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2"
          )}
        >
          {props.options?.map((option, index) => {
            return (
              <SelectMenuItem
                value={option.value}
                key={index}
                className={cn(
                  "text-base-contrast/60",
                  option.value === props.value &&
                    (color === "buy" ? "text-trade-profit" : "text-trade-loss")
                )}
                onValueChange={(value) => {
                  setOpen(false);
                  props.onChange?.(value);
                }}
                //   onSelect={(evnet) => {
                //     props.onChange?.(option.value);
                //   }}
              >
                {option.label}
              </SelectMenuItem>
            );
          })}
        </div>
      )}
    </div>
  );
};

interface SelectMenuItemProps {
  value: string | number;
  //   label: string;
  className?: string;
  //   onSelect?: (event: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  onValueChange: (value: string | number) => void;
}

export const SelectMenuItem: FC<PropsWithChildren<SelectMenuItemProps>> = (
  props
) => {
  const { value, className, onValueChange } = props;
  return (
    <div>
      <button
        type="button"
        className={cn(
          "block p-2 text-inherit w-full h-full text-left text-sm",
          className
        )}
        onClick={() => {
          onValueChange?.(value);
        }}
      >
        {props.children}
      </button>
    </div>
  );
};
