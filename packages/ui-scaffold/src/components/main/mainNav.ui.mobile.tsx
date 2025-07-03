import { FC, useMemo } from "react";
import { useAccount } from "@orderly.network/hooks";
import { useAppContext } from "@orderly.network/react-app";
import { AccountStatusEnum } from "@orderly.network/types";
import { Flex, Text, ChevronLeftIcon } from "@orderly.network/ui";
import { WalletConnectButtonExtension } from "../accountMenu/menu.widget";
import { ChainMenuWidget } from "../chainMenu";
import { LanguageSwitcherWidget } from "../languageSwitcher";
import { RouterAdapter } from "../scaffold";
import { ScanQRCodeWidget } from "../scanQRCode";
import { SubAccountWidget } from "../subAccount";
import { LinkDeviceWidget } from "./linkDevice";
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
  const { state } = useAccount();
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
      <Text className="oui-text-2xl oui-font-bold oui-text-base-contrast">
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

  const showLinkDevice =
    state.status === AccountStatusEnum.EnableTradingWithoutConnected;

  const showChainMenu = !showLinkDevice && !wrongNetwork;

  // TODO: fix this
  const showQrcode = useMemo(() => {
    if (state.status === AccountStatusEnum.EnableTradingWithoutConnected) {
      return false;
    }
    if (state.status === AccountStatusEnum.EnableTrading) {
      return false;
    }
    if (disabledConnect) {
      return false;
    }
    return true;
  }, [state.status, disabledConnect]);

  const showSubAccount = useMemo(
    () => state.status >= AccountStatusEnum.EnableTrading,
    [state.status],
  );

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
        <Text className="oui-text-base oui-font-bold oui-text-base-contrast">
          {subTitle}
        </Text>
      </Flex>
    );
  }

  const renderCustomComponents = () => {
    const languageSwitcher = <LanguageSwitcherWidget />;
    const scanQRCode = showQrcode && <ScanQRCodeWidget />;
    const subAccount = showSubAccount && <SubAccountWidget />;
    const linkDevice = showLinkDevice && <LinkDeviceWidget />;
    const chainMenu = showChainMenu && <ChainMenuWidget />;
    const walletConnect = <WalletConnectButtonExtension />;

    if (typeof props.customRender === "function") {
      return props.customRender?.({
        title,
        languageSwitcher,
        scanQRCode,
        subAccount,
        linkDevice,
        chainMenu,
        walletConnect,
      });
    }

    return (
      <>
        {title}
        <Flex gapX={2}>
          {props.leading}
          {languageSwitcher}
          {scanQRCode}
          {subAccount}
          {linkDevice}
          {chainMenu}
          {walletConnect}
          {props.trailing}
        </Flex>
      </>
    );
  };

  return (
    <Flex
      width={"100%"}
      height={44}
      px={3}
      itemAlign={"center"}
      justify={"between"}
      className={props.classNames?.mainNav?.root}
    >
      {renderCustomComponents()}
    </Flex>
  );
};
