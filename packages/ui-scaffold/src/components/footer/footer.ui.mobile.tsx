import { Flex, Text } from "@orderly.network/ui";
import { FooterMobileNavItem } from "./footer.widget";
import { useMemo } from "react";
import { RouterAdapter } from "../scaffoldContext";

type FooterMobileProps = {
  mainMenus?: FooterMobileNavItem[];
  current?: string;
  onRouteChange?: RouterAdapter["onRouteChange"];
};

export const FooterMobile = (props: FooterMobileProps) => {
  const { mainMenus, current, onRouteChange } = props;

  const menus = useMemo(() => {
    return mainMenus?.map((menu) => {
      const isActive = current === menu.href || (current && menu.href.length > 1 && current?.startsWith(menu.href));
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
