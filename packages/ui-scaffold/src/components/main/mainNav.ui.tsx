import { FC, PropsWithChildren, ReactNode, useMemo } from "react";
import { AccountStatusEnum } from "@orderly.network/types";
import { cn, Divider, Flex, useScreen } from "@orderly.network/ui";
import type { LogoProps } from "@orderly.network/ui";
import { WalletConnectButtonExtension } from "../accountMenu/menu.widget";
import { AccountSummaryWidget } from "../accountSummary";
import { ChainMenuWidget } from "../chainMenu";
import { LanguageSwitcherWidget } from "../languageSwitcher";
import { SubAccountWidget } from "../subAccount";
import { CampaignButton, CampaignProps } from "./campaignButton";
import { LinkDeviceWidget } from "./linkDevice";
import { MainLogo } from "./mainLogo";
import { MainNavMenusExtension } from "./mainMenus/mainNavMenus.widget";
import { MainNavClassNames, MainNavItemsProps } from "./mainNavItems";
import { CampaignPositionEnum } from "./useWidgetBuilder.script";

// export type CampaignPosition = "menuLeading" | "menuTailing" | "navTailing";

export type MainNavProps = {
  className?: string;
  logo: LogoProps;
  mainMenus: MainNavItemsProps;
  leading?: ReactNode;
  trailing?: ReactNode;
  wrongNetwork: boolean;
  isConnected: boolean;
  campaigns?: CampaignProps;
  campaignPosition?: CampaignPositionEnum;
  classNames?: {
    root?: string;
    mainNav?: MainNavClassNames;
    // subNav?: string;
    logo?: string;
    products?: string;
    account?: string;
    chains?: string;
    campaignButton?: string;
  };
  status?: AccountStatusEnum;
  disabledConnect?: boolean;
};

export const MainNav: FC<PropsWithChildren<MainNavProps>> = (props) => {
  const { className, logo, classNames, campaigns, campaignPosition } = props;

  const showCampaignButton =
    campaignPosition === CampaignPositionEnum.navTailing && campaigns;

  const showLinkIcon =
    !props.wrongNetwork &&
    !props.disabledConnect &&
    props.status! >= AccountStatusEnum.SignedIn;

  const showSubAccount = props.status! >= AccountStatusEnum.EnableTrading;

  const hideWalletConnectButton =
    !props.disabledConnect && props.wrongNetwork && props.isConnected;

  const { isDesktop } = useScreen();

  const children = useMemo(() => {
    if (typeof props.children === "undefined") {
      return null;
    }
    return <Flex grow>{props.children}</Flex>;
  }, [props.children]);

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
      <Flex
        itemAlign={"center"}
        className={cn(
          "oui-gap-3",
          // let the left and right views show spacing when overlapping
          "oui-overflow-hidden",
        )}
      >
        <MainLogo {...logo} />
        {props.leading}
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
        {props.trailing}
      </Flex>
      {children}

      <Flex itemAlign={"center"} className="oui-gap-2">
        <AccountSummaryWidget />
        {showLinkIcon && (
          <>
            <Divider direction="vertical" className="oui-h-8" intensity={8} />
            <LinkDeviceWidget />
          </>
        )}
        <LanguageSwitcherWidget />
        {showSubAccount && <SubAccountWidget />}
        {isDesktop && <ChainMenuWidget />}
        {!hideWalletConnectButton && <WalletConnectButtonExtension />}
      </Flex>
    </Flex>
  );
};

MainNav.displayName = "MainNav";
