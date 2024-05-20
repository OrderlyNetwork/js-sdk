import { FC, PropsWithChildren } from "react";

import * as SelectPrimitive from "@radix-ui/react-select";
import {
  SelectContent,
  SelectRoot,
  SelectTrigger,
  SelectValue,
} from "./selectPrimitive";
import { type SizeType } from "../helpers/sizeType";

export type SelectProps = SelectPrimitive.SelectProps & {
  size?: "md" | "sm" | "lg";
  error?: boolean;
};

export const Select: FC<PropsWithChildren<SelectProps>> = (props) => {
  const { children, size, error, ...rest } = props;
  return (
    <SelectRoot {...rest}>
      <SelectTrigger size={size} error={error}>
        <SelectValue placeholder="Select a fruit" />
      </SelectTrigger>
      <SelectContent>{children}</SelectContent>
    </SelectRoot>
  );
};
