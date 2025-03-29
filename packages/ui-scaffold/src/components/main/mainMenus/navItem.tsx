import { ChevronDownIcon, PopoverContent } from "@orderly.network/ui";
import { Flex } from "@orderly.network/ui";
import { Box, cn, PopoverAnchor, PopoverRoot, Text } from "@orderly.network/ui";
import React, {
  cloneElement,
  FC,
  HTMLAttributeAnchorTarget,
  PropsWithChildren,
  ReactElement,
  useCallback,
  useMemo,
  useRef,
  useState,
} from "react";

export type MainNavItem = {
  id?: string;
  testid?: string;
  name: string;
  href: string;
  target?: HTMLAttributeAnchorTarget;
  icon?: string | React.ReactElement;
  activeIcon?: string | React.ReactElement;
  tag?: string;
  description?: string;
  disabled?: boolean;
  children?: MainNavItem[];
  className?: string;
  asChild?: boolean;
};

export const NavItem: FC<
  Omit<React.HTMLAttributes<HTMLButtonElement>, "onClick"> & {
    item: MainNavItem;
    onClick?: (item: MainNavItem[]) => void;
    // active?: boolean;
    currentPath?: string[];
    classNames?: {
      navItem?: string;
      subMenu?: string;
    };
  }
> = (props) => {
  const { classNames, currentPath, item, onClick, ...buttonProps } = props;

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
      id={item.id}
      data-testid={item.testid}
      {...buttonProps}
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
        <Text.gradient
          color={isActive ? "brand" : "inherit"}
          angle={45}
          className="oui-break-normal oui-whitespace-nowrap"
        >
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
                  fill="url(#mainNavDropDownIcon)"
                />
                <defs>
                  <linearGradient
                    id="mainNavDropDownIcon"
                    x1="9.502"
                    y1="5.994"
                    x2="2.502"
                    y2="5.994"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
                    <stop
                      offset="1"
                      stopColor="rgb(var(--oui-gradient-brand-start))"
                    />
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
          "oui-p-1 oui-w-[260px] oui-border oui-border-line-6 oui-space-y-[2px]",
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
      data-active={props.active ?? false}
      className={cn(
        "hover:oui-bg-base-6 oui-cursor-pointer oui-text-base-contrast-80 oui-items-start oui-w-full oui-group data-[active=true]:oui-bg-base-5"
        // props.active && "oui-bg-base-5"
      )}
      r={"md"}
      onClick={() => {
        props.onClick(item);
      }}
      data-testid={item.testid}
    >
      {!!props.item.icon && (
        <div className="oui-translate-y-1 oui-relative oui-w-6 oui-h-6">
          <ItemIcon isActive={props.active ?? false} item={props.item} />
        </div>
      )}

      <div className="oui-flex-1">
        <SubMenuTitle item={item} isActive={props.active} />
        {typeof item.description !== "undefined" && (
          <Text size={"2xs"} as={"div"} intensity={36}>
            {item.description}
          </Text>
        )}
      </div>
    </Flex>
  );
};

const SubMenuTitle = (props: { item: MainNavItem; isActive?: boolean }) => {
  const {
    item: { name },
    isActive,
  } = props;
  return (
    <Flex itemAlign={"center"} width={"100%"} position="relative">
      <div className="oui-flex-1 oui-flex">
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
      </div>
      {props.item.target === "_blank" && <OutlinkIcon />}
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

const ICON_CLASSNAME =
  "oui-flex oui-border oui-border-line oui-w-6 oui-h-6 oui-rounded-md oui-justify-center oui-items-center oui-absolute oui-left-0 oui-top-0";

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
  // return isActive ? props.item.activeIcon || props.item.icon : props.item.icon;
  return (
    <>
      <div
        className={cn(
          ICON_CLASSNAME,
          "group-data-[active=true]:oui-invisible group-hover:oui-invisible"
        )}
      >
        {props.item.icon}
      </div>
      <div
        className={cn(
          ICON_CLASSNAME,
          "oui-invisible group-data-[active=true]:oui-visible group-hover:oui-visible"
        )}
      >
        {props.item.activeIcon || props.item.icon}
      </div>
    </>
  );
};

const OutlinkIcon = () => {
  return (
    <>
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="oui-absolute oui-right-0 oui-top-0 group-hover:oui-invisible"
      >
        <path
          d="M14.159 17.492a3.333 3.333 0 0 0 3.333-3.333V5.826a3.333 3.333 0 0 0-3.333-3.334H5.826a3.333 3.333 0 0 0-3.334 3.334v8.333a3.333 3.333 0 0 0 3.334 3.333zm-6.667-4.166a.85.85 0 0 1-.599-.235.86.86 0 0 1 0-1.198l3.333-3.333-1.9-1.901h5v5l-1.901-1.9L8.09 13.09a.84.84 0 0 1-.599.235"
          fill="#fff"
          fillOpacity=".2"
        />
      </svg>

      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="oui-absolute oui-right-0 oui-top-0 oui-invisible group-hover:oui-visible"
      >
        <path
          d="M14.159 17.492a3.333 3.333 0 0 0 3.333-3.333V5.826a3.333 3.333 0 0 0-3.333-3.334H5.826a3.333 3.333 0 0 0-3.334 3.334v8.333a3.333 3.333 0 0 0 3.334 3.333zm-6.667-4.166a.85.85 0 0 1-.599-.235.86.86 0 0 1 0-1.198l3.333-3.333-1.9-1.901h5v5l-1.901-1.9L8.09 13.09a.84.84 0 0 1-.599.235"
          fill="url(#outlineIcon)"
        />
        <defs>
          <linearGradient
            id="outlineIcon"
            x1="17.492"
            y1="9.992"
            x2="2.492"
            y2="9.992"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
            <stop offset="1" stopColor="rgb(var(--oui-gradient-brand-start))" />
          </linearGradient>
        </defs>
      </svg>
    </>
  );
};
