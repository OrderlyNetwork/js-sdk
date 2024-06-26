import { PropsWithChildren, useMemo } from "react";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from "./dropdown";

type Menu = {
  label: string;
  value: string;
};

type DropdownMenuProps = {
  menu: Menu[];
  render?: (item: Menu, index: number) => React.ReactNode;
};

const DropdownMenu = (props: PropsWithChildren<DropdownMenuProps>) => {
  const items = useMemo(() => {
    if (typeof props.render !== "undefined") {
      return props.menu.map((item, index) => {
        return props.render(item, index);
      });
    }

    return props.menu.map((item) => (
      <DropdownMenuItem textValue={item.value} key={item.label}>
        {item.label}
      </DropdownMenuItem>
    ));
  }, [props.menu, props.render]);
  return (
    <DropdownMenuRoot>
      <DropdownMenuTrigger></DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent>{items}</DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenuRoot>
  );
};

export { DropdownMenu };
