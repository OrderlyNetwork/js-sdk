import { PropsWithChildren, type ReactNode, useMemo } from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "./dropdown";
import type { DropdownMenuContentProps } from "@radix-ui/react-dropdown-menu";
import { SizeType } from "../helpers/sizeType";

export type MenuItem = {
  label: string;
  value: string;
  testId?: string;
};

type DropdownMenuProps = {
  menu: MenuItem[];
  onSelect?: (item: MenuItem) => void;
  render?: (item: MenuItem, index: number) => ReactNode;
  size?: SizeType;
} & DropdownMenuContentProps;

const SimpleDropdownMenu = (props: PropsWithChildren<DropdownMenuProps>) => {
  const { menu, render, size, children, ...contentProps } = props;

  const items = useMemo(() => {
    if (typeof props.render === "function") {
      return props.menu.map((item, index) => {
        return props.render?.(item, index);
      });
    }

    return props.menu.map((item) => (
      <DropdownMenuItem
        textValue={item.value}
        key={item.value}
        onSelect={(event) => {
          props.onSelect?.(item);
        }}
        size={size}
        data-testid={item.testId}
      >
        {item.label}
      </DropdownMenuItem>
    ));
  }, [props.menu, props.render]);
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent size={size} {...contentProps}>
          {items}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

export { SimpleDropdownMenu };
