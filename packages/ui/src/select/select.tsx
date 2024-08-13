import React, { FC, PropsWithChildren, ReactElement } from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import {
  SelectContent,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  selectVariants,
} from "./selectPrimitive";

import { cnBase, VariantProps } from "tailwind-variants";

export type SelectProps<T> = SelectPrimitive.SelectProps & {
  placeholder?: string;
  valueFormatter?: (
    value: T,
    options: {
      placeholder?: string;
    }
  ) => string;
  contentProps?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;
  showCaret?: boolean;
} & VariantProps<typeof selectVariants>;

export const Select = <T,>(props: PropsWithChildren<SelectProps<T>>) => {
  const {
    children,
    size,
    error,
    placeholder,
    variant,
    contentProps,
    valueFormatter: valueRenderer,
    showCaret,
    ...rest
  } = props;

  return (
    <SelectRoot {...rest}>
      <SelectTrigger
        size={size}
        error={error}
        variant={variant}
        showCaret={showCaret}
        className={cnBase(
          "oui-font-semibold focus:oui-ring-transparent",
          !showCaret && "oui-cursor-auto"
        )}
      >
        {typeof valueRenderer === "function" ? (
          valueRenderer((props.value || props.defaultValue) as T, {
            placeholder,
          })
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent {...contentProps}>{children}</SelectContent>
    </SelectRoot>
  );
};
