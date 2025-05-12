import { useMemo } from "react";
import { Flex, Text } from "@orderly.network/ui";
import { RouterAdapter } from "../scaffold";
import { FooterMobileNavItem } from "./footer.widget";

type FooterMobileProps = {
  mainMenus?: FooterMobileNavItem[];
  current?: string;
  onRouteChange?: RouterAdapter["onRouteChange"];
};

export const FooterMobile = (props: FooterMobileProps) => {
  const { mainMenus, current, onRouteChange } = props;

  const isSubmenu = useMemo(() => {
    return mainMenus?.every((menu) => menu.href !== current);
  }, [mainMenus, current]);

  const menus = useMemo(() => {
    return mainMenus?.map((menu) => {
      const isActive =
        current === menu.href ||
        (current && menu.href.length > 1 && current?.startsWith(menu.href));
      return (
        <Flex
          key={menu.name}
          direction={"column"}
          itemAlign={"center"}
          justify={"center"}
          className="oui-flex-1"
          onClick={() => {
            onRouteChange?.({ href: menu.href, name: menu.name });
          }}
        >
          <Text>{isActive ? menu.activeIcon : menu.inactiveIcon}</Text>
          <Text>{menu.name}</Text>
        </Flex>
      );
    });
  }, [mainMenus, current, onRouteChange]);

  if (isSubmenu) {
    return null;
  }

  return (
    <Flex
      width={"100%"}
      height={64}
      px={3}
      itemAlign={"center"}
      justify={"between"}
      className="oui-bg-base-9"
    >
      {menus}
    </Flex>
  );
};
