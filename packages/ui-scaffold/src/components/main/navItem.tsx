import { ChevronDownIcon, PopoverContent } from "@orderly.network/ui";
import { Flex } from "@orderly.network/ui";
import { Box, cn, PopoverAnchor, PopoverRoot, Text } from "@orderly.network/ui";
import React, {
  cloneElement,
  FC,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export type MainNavItem = {
  name: string;
  href: string;
  icon?: string | React.ReactElement;
  activeIcon?: string | React.ReactElement;
  tag?: string;
  description?: string;
  disabled?: boolean;
  children?: MainNavItem[];
  className?: string;
};

export const NavItem: FC<{
  item: MainNavItem;
  onClick?: (item: MainNavItem[]) => void;
  // active?: boolean;
  currentPath?: string[];
  classNames?: {
    navItem?: string;
    subMenu?: string;
  };
}> = (props) => {
  const { classNames, currentPath } = props;

  const isActive = useMemo(
    () => props.currentPath?.[0] === props.item.href,
    [currentPath]
  );

  const onClickHandler = useCallback(() => {
    if (Array.isArray(props.item.children)) return;
    props.onClick?.([props.item]);
  }, [props.item]);

  const button = (
    <button
      disabled={props.item.disabled}
      data-actived={isActive}
      className={cn(
        "oui-text-base-contrast-36 oui-text-sm oui-relative oui-group oui-rounded oui-px-3 oui-py-1 oui-h-[32px] hover:oui-bg-base-7",
        classNames?.navItem
      )}
      onClick={onClickHandler}
    >
      <span className={"oui-flex oui-items-center"}>
        <ItemIcon isActive={isActive} item={props.item} />
        <Text.gradient color={isActive ? "brand" : "inherit"} angle={45}>
          {props.item.name}
        </Text.gradient>
        {Array.isArray(props.item.children) && (
          <span className={"oui-ml-1 group-data-[open=true]:oui-rotate-180"}>
            {isActive ? (
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M2.913 4.515a.5.5 0 0 0-.328.202.51.51 0 0 0 .14.701L5.722 7.41a.51.51 0 0 0 .562 0l2.995-1.992a.51.51 0 0 0 .14-.7.51.51 0 0 0-.701-.14L6.002 6.382 3.287 4.577a.5.5 0 0 0-.374-.062"
                  fill="url(#a)"
                />
                <defs>
                  <linearGradient
                    id="a"
                    x1="9.502"
                    y1="5.994"
                    x2="2.502"
                    y2="5.994"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stop-color="#59B0FE" />
                    <stop offset="1" stop-color="#26FEFE" />
                  </linearGradient>
                </defs>
              </svg>
            ) : (
              <ChevronDownIcon size={12} color={"white"} />
            )}
          </span>
        )}
      </span>
      <Box
        invisible={!isActive}
        position="absolute"
        bottom={0}
        left={"50%"}
        height={"3px"}
        r="full"
        width={"60%"}
        gradient="brand"
        angle={45}
        className="-oui-translate-x-1/2 "
      />
    </button>
  );

  if (!Array.isArray(props.item.children)) return button;

  return (
    <SubMenus
      items={props.item.children}
      className={classNames?.subMenu}
      current={props.currentPath?.[1]}
      onItemClick={(subItem: MainNavItem) => {
        props.onClick?.([props.item, subItem]);
      }}
    >
      {button}
    </SubMenus>
  );
};

const SubMenus = (
  props: PropsWithChildren<{
    items: MainNavItem[];
    className?: string;
    current?: string;
    onItemClick: (item: MainNavItem) => void;
  }>
) => {
  const [open, setOpen] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onMouseEnter = useCallback(() => {
    if (timer.current) {
      clearTimeout(timer.current);
      timer.current = null;
    }
    // setOpen(true);
  }, []);

  const classNames = (props.children as ReactElement).props.className;

  return (
    <PopoverRoot open={open}>
      <PopoverAnchor>
        <div
          className={"oui-group"}
          data-open={open}
          onMouseEnter={() => {
            setOpen(true);
          }}
          onMouseLeave={() => {
            timer.current = setTimeout(() => {
              setOpen(false);
            }, 150);
          }}
        >
          {cloneElement(props.children as React.ReactElement, {
            className: cn(classNames, open && "oui-bg-base-7"),
          })}
        </div>
      </PopoverAnchor>
      <PopoverContent
        align="start"
        onMouseEnter={onMouseEnter}
        onMouseLeave={() => {
          setOpen(false);
          timer.current ? clearTimeout(timer.current) : void 0;
        }}
        className={cn(
          "oui-p-1 oui-w-[260px] oui-border oui-border-line-6",
          props.className
        )}
      >
        {props.items.map((item, index) => {
          return (
            <SubMenu
              key={index}
              item={item}
              onClick={props.onItemClick}
              active={item.href === props.current}
            />
          );
        })}
      </PopoverContent>
    </PopoverRoot>
  );
};

const SubMenu = (props: {
  item: MainNavItem;
  active?: boolean;
  onClick: (item: MainNavItem) => void;
}) => {
  const { item } = props;
  return (
    <Flex
      px={2}
      py={3}
      gapX={2}
      className={cn(
        "hover:oui-bg-base-6 oui-cursor-pointer oui-text-base-contrast-80",
        props.active && "oui-bg-base-5"
      )}
      r={"md"}
      onClick={() => {
        props.onClick(item);
      }}
    >
      <ItemIcon isActive={props.active ?? false} item={props.item} />
      <Flex direction={"column"} itemAlign={"start"}>
        <SubMenuTitle item={item} isActive={props.active} />
        {typeof item.description !== "undefined" && (
          <Text size={"2xs"} as={"div"} intensity={36}>
            {item.description}
          </Text>
        )}
      </Flex>
    </Flex>
  );
};

const SubMenuTitle = (props: { item: MainNavItem; isActive?: boolean }) => {
  const {
    item: { name },
    isActive,
  } = props;
  return (
    <Flex itemAlign={"center"}>
      <Text.gradient
        color={isActive ? "brand" : "inherit"}
        size={"xs"}
        as={"div"}
        intensity={80}
        weight={"semibold"}
      >
        {name}
      </Text.gradient>
      {typeof props.item.tag !== "undefined" && <Tag item={props.item} />}
    </Flex>
  );
};

const Tag = (props: { item: MainNavItem }) => {
  return (
    <div
      className={
        "oui-px-2 oui-py-1 oui-ml-1 oui-rounded oui-inline-flex oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)] oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)]"
      }
    >
      <Text.gradient color={"brand"} size={"3xs"}>
        {props.item.tag}
      </Text.gradient>
    </div>
  );
};

const ItemIcon = (props: { item: MainNavItem; isActive: boolean }) => {
  const { item, isActive } = props;

  if (!props.item.icon) return null;
  if (typeof props.item.icon === "string") {
    return (
      <span className={"oui-w-[20px] oui-h-[20px] oui-mr-1"}>
        {
          <img
            src={
              isActive
                ? (props.item.activeIcon as string) || props.item.icon
                : props.item.icon
            }
            className={"oui-max-w-full oui-max-h-full"}
          />
        }
      </span>
    );
  }
  return isActive ? props.item.activeIcon || props.item.icon : props.item.icon;
};
