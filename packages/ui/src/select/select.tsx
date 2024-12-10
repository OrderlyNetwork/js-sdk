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
import { ScrollArea } from "../scrollarea";

export type SelectVariantProps = VariantProps<typeof selectVariants>;

export type SelectProps<T> = SelectPrimitive.SelectProps & {
  placeholder?: string;
  valueFormatter?: (
    value: T,
    options: {
      placeholder?: string;
    }
  ) => React.ReactNode;
  contentProps?: React.ComponentPropsWithoutRef<typeof SelectPrimitive.Content>;
  showCaret?: boolean;
  maxHeight?: number;
  testid?: string;
} & SelectVariantProps;

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
    maxHeight,
    testid,
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
        data-testid={testid}
      >
        {typeof valueRenderer === "function" ? (
          valueRenderer((props.value || props.defaultValue) as T, {
            placeholder,
          })
        ) : (
          <SelectValue placeholder={placeholder} />
        )}
      </SelectTrigger>
      <SelectContent {...contentProps}>
        <ScrollArea>
          <div style={{ maxHeight }}> {children}</div>
        </ScrollArea>
      </SelectContent>
    </SelectRoot>
  );
};
