import { FC, PropsWithChildren } from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import {
  SelectContent,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./selectPrimitive";

export type SelectProps = SelectPrimitive.SelectProps & {
  size?: "md" | "sm" | "lg";
  error?: boolean;
  placeholder?: React.ReactNode;
};

export const Select: FC<PropsWithChildren<SelectProps>> = (props) => {
  const { children, size, error, placeholder, ...rest } = props;
  return (
    <SelectRoot {...rest}>
      <SelectTrigger size={size} error={error}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </SelectRoot>
  );
};
