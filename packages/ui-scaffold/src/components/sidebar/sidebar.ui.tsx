import React, { FC, memo } from "react";
import { Box, Flex, tv, VariantProps, Text } from "@orderly.network/ui";

type SideMenuItem = {
  name: string;
  icon?: React.ReactNode;
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
      // "oui-flex",
      "oui-group",
      // "oui-space-x-2",
      // "oui-items-center",
      "hover:oui-bg-base-8",
      "oui-transition-colors",
      "group-data-[state=closed]/bar:oui-w-[42px]",
      "oui-overflow-hidden",
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
    active: {
      true: {
        button: "oui-bg-base-5 hover:oui-bg-base-5",
      },
    },
    open: {
      true: {
        button: "",
      },
    },
  },
});

const MenuItem: FC<
  {
    item: SideMenuItem;
    active?: boolean;
    open?: boolean;
    onClick?: (item: SideMenuItem) => void;
  } & VariantProps<typeof menuItemVariants>
> = memo((props) => {
  const { item, mode, open, onClick, active, ...rest } = props;
  const { button } = menuItemVariants({
    mode,
    active: props.active,
    open: props.open,
  });
  return (
    <li className="oui-min-w-[120px]">
      <button
        data-actived={props.active}
        disabled={item.disabled}
        className={button()}
        onClick={() => {
          props.onClick?.(item);
        }}
      >
        <Flex itemAlign={"center"} gap={2} as="span">
          {item.icon}
          {props.open && (
            <Text.gradient
              color={props.active ? "brand" : "inherit"}
              angle={45}
              size="base"
              className="oui-animate-in oui-fade-in"
            >
              {item.name}
            </Text.gradient>
          )}
        </Flex>
      </button>
    </li>
  );
});

const SideMenus: FC<{
  menus: SideMenuItem[];
  current?: string;
  open?: boolean;
  onItemSelect?: (item: SideMenuItem) => void;
}> = (props) => {
  return (
    <Box py={6}>
      <svg
        width="18"
        height="18"
        viewBox="0 0 18 18"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="oui-absolute oui-invisible oui-pointer-events-none"
      >
        <defs>
          <linearGradient
            id="side-menu-gradient"
            x1="15.7432"
            y1="8.94726"
            x2="2.24316"
            y2="8.94726"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#59B0FE" />
            <stop offset="1" stopColor="#26FEFE" />
          </linearGradient>
        </defs>
      </svg>
      <ul className="oui-space-y-4">
        {props.menus.map((item, index) => {
          return (
            <MenuItem
              key={index}
              item={item}
              open={props.open}
              active={item.href === props.current}
              onClick={props.onItemSelect}
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
    <Flex
      justify={props.open ? "between" : "center"}
      itemAlign={"center"}
      className="oui-h-6"
    >
      {props.open ? (
        <Text intensity={54} size="xs">
          Portfolio
        </Text>
      ) : null}

      <button
        onClick={() => {
          props.onToggle?.();
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="group-data-[state=closed]/bar:oui-rotate-90"
        >
          <path
            d="M5.82552 17.4922C3.98469 17.4922 2.49219 15.9997 2.49219 14.1589V5.82552C2.49219 3.98469 3.98469 2.49219 5.82552 2.49219H14.1589C15.9997 2.49219 17.4922 3.98469 17.4922 5.82552V14.1589C17.4922 15.9997 15.9997 17.4922 14.1589 17.4922H5.82552ZM12.4922 13.3255C12.7055 13.3255 12.928 13.2538 13.0913 13.0913C13.4163 12.7655 13.4163 12.2189 13.0913 11.893L9.75802 8.55969L11.6589 6.65885H6.65885V11.6589L8.55969 9.75802L11.893 13.0913C12.0555 13.2538 12.2789 13.3255 12.4922 13.3255Z"
            fill="white"
            fillOpacity="0.2"
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

const SideBar = (props: SideBarProps) => {
  const { open = true, items, current, onItemSelect } = props;

  return (
    <Box data-state={open ? "opened" : "closed"} className="oui-group/bar">
      <SideBarHeader
        open={open}
        onToggle={() => {
          props.onOpenChange?.(!open);
        }}
      />
      <SideMenus
        menus={items}
        current={current}
        onItemSelect={onItemSelect}
        open={open}
      />
    </Box>
  );
};

SideBar.displayName = "SideBar";

export { SideBar };

export type { SideBarProps, SideMenuItem };
