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
    //@ts-ignore
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
        //
        document.removeEventListener("touchstart", onTouchStart);
        document.removeEventListener("click", onClick);
      };
    } else {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("click", onClick);
    }
  }, [open]);

  return (
    <div className="orderly-relative" ref={containerRef}>
      <button
        id={props.id}
        type="button"
        disabled={Boolean(disabled)}
        onClick={() => setOpen((open) => !open)}
        className={cn(
          "orderly-select",
          "orderly-flex orderly-flex-row orderly-items-center orderly-rounded orderly-space-x-1 orderly-text-3xs desktop:orderly-text-2xs",
          selectVariants({
            size,
            disabled: disabled || options.length === 0,
            className,
            color,
            fullWidth,
          }),
          open && "orderly-bg-base-600"
        )}
      >
        <span className="orderly-flex orderly-flex-1 orderly-text-inherit">
          {typeof label !== "undefined" && <>{label}</>}
        </span>

        <ArrowIcon
          size={12}
          className={cx(
            "orderly-transition-transform",
            open && "orderly-rotate-180"
          )}
        />
      </button>
      {open && (
        <div
          data-state={open ? "open" : "closed"}
          className={cn(
            "orderly-select-menu",
            "orderly-z-50 orderly-min-w-[8rem] orderly-overflow-hidden orderly-rounded orderly-bg-base-600 orderly-p-1 orderly-text-popover-foreground orderly-shadow-md orderly-py-2 orderly-absolute orderly-left-0 orderly-top-full orderly-mt-1 orderly-w-full orderly-space-y-1",
            "data-[state=open]:orderly-animate-in data-[state=closed]:orderly-animate-out data-[state=closed]:orderly-fade-out-0 data-[state=open]:orderly-fade-in-0 data-[state=closed]:orderly-zoom-out-95 data-[state=open]:orderly-zoom-in-95 data-[side=bottom]:orderly-slide-in-from-top-2 data-[side=left]:orderly-slide-in-from-right-2 data-[side=right]:orderly-slide-in-from-left-2 data-[side=top]:orderly-slide-in-from-bottom-2"
          )}
        >
          {props.options?.map((option, index) => {
            return (
              <SelectMenuItem
                id={option.id}
                value={option.value}
                key={index}
                className={cn(
                  "orderly-text-base-contrast-54 hover:orderly-bg-base-700 orderly-rounded",
                  option.value === props.value &&
                    (color === "buy"
                      ? "orderly-text-trade-profit"
                      : "orderly-text-trade-loss")
                )}
                onValueChange={(value) => {
                  setOpen(false);
                  // @ts-ignore
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
  id?: string;
}

export const SelectMenuItem: FC<PropsWithChildren<SelectMenuItemProps>> = (
  props
) => {
  const { value, className, onValueChange } = props;
  return (
    <div>
      <button
        id={props.id}
        type="button"
        className={cn(
          "orderly-block orderly-p-2 orderly-text-inherit orderly-w-full orderly-h-full orderly-text-left orderly-text-3xs  desktop:orderly-text-xs",
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
