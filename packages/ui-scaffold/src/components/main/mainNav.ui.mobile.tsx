import { FC, useMemo } from "react";
import { useAppContext } from "@orderly.network/react-app";
import { Flex, Text, ChevronLeftIcon } from "@orderly.network/ui";
import { WalletConnectButtonExtension } from "../accountMenu/menu.widget";
import { ChainMenuWidget } from "../chainMenu";
import { LanguageSwitcherWidget } from "../languageSwitcher";
import { RouterAdapter } from "../scaffold";
import { ScanQRCodeWidget } from "../scanQRCode";
import { MainLogo } from "./mainLogo";
import { MainNavWidgetProps } from "./mainNav.widget";

type Props = {
  current?: string;
  subItems?: {
    name: string;
    href: string;
  }[];
  routerAdapter?: RouterAdapter;
} & MainNavWidgetProps;

export const MainNavMobile: FC<Props> = (props) => {
  const { wrongNetwork, disabledConnect } = useAppContext();
  const currentMenu = useMemo(() => {
    if (Array.isArray(props?.initialMenu)) {
      return props?.campaigns;
    }
    return props?.mainMenus?.find((menu) => {
      if (!props.current) {
        return menu.href === props?.initialMenu;
      } else {
        return menu.href === props.current;
      }
    });
  }, [props?.mainMenus, props?.initialMenu]);

  const title = useMemo(() => {
    if (currentMenu?.isHomePageInMobile) {
      return <MainLogo {...props?.logo} />;
    }
    return (
      <Text className="oui-text-base-contrast-98 oui-text-2xl oui-font-bold">
        {currentMenu?.name}
      </Text>
    );
  }, [currentMenu, props?.logo]);

  const isSub = useMemo(() => {
    if (!currentMenu || currentMenu.isSubMenuInMobile) return true;
    return false;
  }, [currentMenu]);

  const subTitle = useMemo(() => {
    if (currentMenu?.isSubMenuInMobile) return currentMenu?.name;
    if (props?.subItems?.some((item) => item.href === props?.current)) {
      return props?.subItems?.find((item) => item.href === props?.current)
        ?.name;
    }
    return null;
  }, [props?.subItems, props?.current, currentMenu]);

  const onBack = () => {
    let target = props.mainMenus?.find(
      (item) => item.href === props.initialMenu,
    );
    if (currentMenu?.isSubMenuInMobile) {
      target = currentMenu?.subMenuBackNav;
    }
    props?.routerAdapter?.onRouteChange(target as any);
  };

  const renderContent = () => {
    if (wrongNetwork) {
      return null;
    }
    return (
      <>
        <ChainMenuWidget />
      </>
    );
  };

  if (isSub) {
    return (
      <Flex
        width={"100%"}
        height={44}
        px={3}
        direction={"row"}
        itemAlign={"center"}
        justify={"center"}
        className="oui-relative"
      >
        <ChevronLeftIcon
          className="oui-absolute oui-left-6 oui-text-base-contrast-54"
          onClick={onBack}
        />
        <Text className="oui-text-base-contrast-98 oui-text-base oui-font-bold">
          {subTitle}
        </Text>
      </Flex>
    );
  }

  return (
    <Flex
      width={"100%"}
      height={44}
      px={3}
      itemAlign={"center"}
      justify={"between"}
    >
      <Flex>{title}</Flex>
      <Flex gapX={2}>
        <LanguageSwitcherWidget />
        <ScanQRCodeWidget />
        {renderContent()}
        <WalletConnectButtonExtension />
      </Flex>
    </Flex>
  );
};
