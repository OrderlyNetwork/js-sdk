import { FC, PropsWithChildren, useMemo } from "react";
import { AccountStatusEnum, ChainNamespace } from "@orderly.network/types";
import { cn, Divider, Flex, useScreen } from "@orderly.network/ui";
import { WalletConnectButtonExtension } from "../accountMenu/menu.widget";
import { AccountSummaryWidget } from "../accountSummary";
import { ChainMenuWidget } from "../chainMenu";
import { LanguageSwitcherWidget } from "../languageSwitcher";
import { SubAccountWidget } from "../subAccount";
import { CampaignButton } from "./campaignButton";
import { LinkDeviceWidget } from "./linkDevice";
import { MainLogo } from "./mainLogo";
import { MainNavMenusExtension } from "./mainMenus/mainNavMenus.widget";
import { CampaignPositionEnum, MainNavScriptReturn } from "./mainNav.script";
import { StarchildSearchButton } from "./starchildSearchButton";

export const MainNav: FC<PropsWithChildren<MainNavScriptReturn>> = (props) => {
  const { className, classNames, campaigns, campaignPosition } = props;

  const showCampaignButton =
    campaignPosition === CampaignPositionEnum.navTailing && campaigns;

  const showLinkIcon =
    !props.wrongNetwork &&
    !props.disabledConnect &&
    props.status! >= AccountStatusEnum.SignedIn;

  const showSubAccount = props.status! >= AccountStatusEnum.EnableTrading;

  const hideWalletConnectButton =
    !props.disabledConnect && props.wrongNetwork && props.isConnected;

  const showSearchButton =
    props.starChildEnabled &&
    props.namespace === ChainNamespace.evm &&
    (props.status! >= AccountStatusEnum.EnableTrading ||
      props.status === AccountStatusEnum.EnableTradingWithoutConnected);

  const { isDesktop } = useScreen();

  const children = useMemo(() => {
    if (typeof props.children === "undefined") {
      return null;
    }
    return <Flex grow>{props.children}</Flex>;
  }, [props.children]);

  const showChainMenu = isDesktop;

  const renderContent = () => {
    const title = <MainLogo {...props.logo} />;
    const starchildSearchButton = showSearchButton && <StarchildSearchButton />;
    const accountSummary = <AccountSummaryWidget />;
    const linkDevice = showLinkIcon && <LinkDeviceWidget />;
    const languageSwitcher = <LanguageSwitcherWidget />;
    const subAccount = showSubAccount && <SubAccountWidget />;
    const chainMenu = showChainMenu && <ChainMenuWidget />;
    const walletConnect = !hideWalletConnectButton && (
      <WalletConnectButtonExtension />
    );

    const mainNav = (
      <>
        <MainNavMenusExtension
          {...props.mainMenus}
          classNames={classNames?.mainNav}
        />
        {!!showCampaignButton && (
          <CampaignButton
            {...campaigns}
            className={classNames?.campaignButton}
          />
        )}
      </>
    );

    if (typeof props.customRender === "function") {
      return props.customRender?.({
        title,
        mainNav,
        starchildSearchButton,
        accountSummary,
        linkDevice,
        languageSwitcher,
        subAccount,
        chainMenu,
        walletConnect,
      });
    }

    return (
      <>
        <Flex
          itemAlign={"center"}
          className={cn(
            "oui-gap-3",
            // let the left and right views show spacing when overlapping
            "oui-overflow-hidden",
          )}
        >
          {title}
          {props.leading}
          {mainNav}
          {props.trailing}
        </Flex>

        {children}

        <Flex itemAlign={"center"} className="oui-gap-2">
          {isDesktop && showSearchButton && (
            <>
              {starchildSearchButton}
              <Divider direction="vertical" className="oui-h-8" intensity={8} />
            </>
          )}
          {accountSummary}
          {showLinkIcon && (
            <>
              <Divider direction="vertical" className="oui-h-8" intensity={8} />
              {linkDevice}
            </>
          )}
          {languageSwitcher}
          {subAccount}
          {chainMenu}
          {walletConnect}
        </Flex>
      </>
    );
  };

  return (
    <Flex
      width="100%"
      as="header"
      itemAlign={"center"}
      height={"48px"}
      justify={"between"}
      px={3}
      gapX={3}
      className={cn(
        "oui-main-nav oui-font-semibold",
        className,
        classNames?.root,
      )}
    >
      {renderContent()}
    </Flex>
  );
};

MainNav.displayName = "MainNav";
