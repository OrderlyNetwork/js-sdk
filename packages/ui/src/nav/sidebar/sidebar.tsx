import React, { FC } from "react";
import { Box } from "../../box";
import { Flex } from "../../flex";
import { Text } from "../../typography";
import { VariantProps, tv } from "tailwind-variants";

type SideMenuItem = {
  name: string;
  icon: React.ReactNode;
  href?: string;
  disabled?: boolean;
  onClick?: () => void;
};

const menuItemVariants = tv({
  slots: {
    button: [
      "oui-h-10",
      "oui-px-3",
      "oui-rounded-md",
      "oui-w-full",
      "oui-text-left",
      "oui-text-base",
      "oui-text-base-contrast-36",
      "hover:oui-bg-base-4",
    ],
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
    actived: {
      true: {
        button: "oui-bg-base-5 hover:oui-bg-base-5",
      },
    },
  },
});

const MenuItem: FC<
  {
    item: SideMenuItem;
    actived?: boolean;
  } & VariantProps<typeof menuItemVariants>
> = (props) => {
  const { item, mode } = props;
  const { button } = menuItemVariants({ mode, actived: props.actived });
  return (
    <li>
      <button disabled={item.disabled} className={button()}>
        {item.icon}
        <Text.gradient color={props.actived ? "brand" : "inherit"} angle={45}>
          {item.name}
        </Text.gradient>
      </button>
    </li>
  );
};

const SideMenus: FC<{
  menus: SideMenuItem[];
  current?: string;
}> = (props) => {
  return (
    <Box py={6}>
      <ul className="oui-space-y-4">
        {props.menus.map((item, index) => {
          return (
            <MenuItem
              key={index}
              item={item}
              actived={item.href === props.current}
            />
          );
        })}
      </ul>
    </Box>
  );
};

type SideBarHeaderProps = {
  onToggle?: () => void;
  open?: boolean;
};

const SideBarHeader: FC<SideBarHeaderProps> = (props) => {
  return (
    <Flex justify={"between"}>
      <Text neutral={54}>Portfolio</Text>
      <button>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5.82552 17.4922C3.98469 17.4922 2.49219 15.9997 2.49219 14.1589V5.82552C2.49219 3.98469 3.98469 2.49219 5.82552 2.49219H14.1589C15.9997 2.49219 17.4922 3.98469 17.4922 5.82552V14.1589C17.4922 15.9997 15.9997 17.4922 14.1589 17.4922H5.82552ZM12.4922 13.3255C12.7055 13.3255 12.928 13.2538 13.0913 13.0913C13.4163 12.7655 13.4163 12.2189 13.0913 11.893L9.75802 8.55969L11.6589 6.65885H6.65885V11.6589L8.55969 9.75802L11.893 13.0913C12.0555 13.2538 12.2789 13.3255 12.4922 13.3255Z"
            fill="white"
            fill-opacity="0.2"
          />
        </svg>
      </button>
    </Flex>
  );
};

type SideBarProps = {
  items: SideMenuItem[];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onItemSelect?: (item: SideMenuItem) => void;
  current?: string;
  className?: string;
  maxWidth?: number;
  minWidth?: number;
};

const SideBar: FC<SideBarProps> = (props) => {
  const { open, items, current } = props;
  return (
    <Box>
      <SideBarHeader />
      <SideMenus menus={items} current={current} />
    </Box>
  );
};

SideBar.displayName = "SideBar";

export { SideBar };
