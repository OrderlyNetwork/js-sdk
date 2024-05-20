import React, { FC } from "react";
import { Box } from "../box";
import { VariantProps, tv } from "tailwind-variants";

type SideMenuItem = {
  label: string;
  icon: React.ReactNode;
  disabled?: boolean;
  onClick: () => void;
};

const menuItemVariants = tv({
  slots: {
    button: ["oui-h-10"],
    icon: [],
  },
  variants: {
    mode: {
      "icon-only": {
        button: "oui-w-10",
        icon: "w-6 h-6",
      },
      full: {
        button: "oui-full",
        icon: "w-6 h-6",
      },
    },
  },
});

const MenuItem: FC<
  {
    item: SideMenuItem;
  } & VariantProps<typeof menuItemVariants>
> = (props) => {
  const { item, mode } = props;
  const { button } = menuItemVariants({ mode });
  return (
    <button disabled={item.disabled} className={button()}>
      {item.icon}
      <span>{item.label}</span>
    </button>
  );
};

const SideMenus: FC<{
  menus: SideMenuItem[];
}> = (props) => {
  return (
    <Box>
      {props.menus.map((item, index) => (
        <MenuItem key={index} item={item} />
      ))}
    </Box>
  );
};

type SideBarProps = {
  items: SideMenuItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onItemSelect?: (item: SideMenuItem) => void;
  className?: string;
  maxWidth?: number;
  minWidth?: number;
};

const SideBar: FC<SideBarProps> = (props) => {
  const { open, items } = props;
  return <Box></Box>;
};

SideBar.displayName = "SideBar";

export { SideBar };
