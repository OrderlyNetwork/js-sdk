import { FC, PropsWithChildren, useMemo } from "react";
import { MainNavClassNames, MainNavItemsProps } from "./mainNavItems";
import { ProductsMenu, ProductsProps } from "./products";
import { cn, Divider, Flex, useScreen } from "@orderly.network/ui";
import type { LogoProps } from "@orderly.network/ui";
import { AccountSummaryWidget } from "../accountSummary";
import { ChainMenuWidget } from "../chainMenu";
import { CampaignPositionEnum } from "./useWidgetBuilder.script";
import { CampaignButton, CampaignProps } from "./campaignButton";
import { MainLogo } from "./mainLogo";
import { MainNavMenusExtension } from "./mainMenus/mainNavMenus.widget";
import { WalletConnectButtonExtension } from "../accountMenu/menu.widget";
import { AccountStatusEnum } from "@orderly.network/types";
import { LinkDeviceWidget } from "./linkDevice";
import { LanguageSwitcherWidget } from "../languageSwitcher";

// export type CampaignPosition = "menuLeading" | "menuTailing" | "navTailing";

export type MainNavProps = {
  className?: string;
  logo: LogoProps;
  products: ProductsProps;
  mainMenus: MainNavItemsProps;
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
  const { className, logo, products, classNames, campaigns, campaignPosition } =
    props;

  const showCampaignButton =
    campaignPosition === CampaignPositionEnum.navTailing && campaigns;

  const showLinkIcon =
    !props.wrongNetwork &&
    !props.disabledConnect &&
    props.status! >= AccountStatusEnum.SignedIn;

  const hideWalletConnectButton =
    !props.disabledConnect && props.wrongNetwork && props.isConnected;

  const { isDesktop } = useScreen();

  const children = useMemo(() => {
    if (typeof props.children === "undefined") return null;

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
        classNames?.root
      )}
    >
      <Flex
        itemAlign={"center"}
        className={cn(
          "oui-gap-3 2xl:oui-gap-4",
          // let the left and right views show spacing when overlapping
          "oui-overflow-hidden"
        )}
      >
        <MainLogo {...logo} />
        <ProductsMenu {...products} className={classNames?.products} />
        {/* <MainNavItems {...props.mainMenus} classNames={classNames?.mainNav} /> */}
        <MainNavMenusExtension
          {...props.mainMenus}
          classNames={classNames?.mainNav}
        />
      </Flex>
      {children}

      <Flex itemAlign={"center"} className="oui-gap-3 2xl:oui-gap-4">
        {!!showCampaignButton && (
          <CampaignButton
            {...campaigns}
            className={classNames?.campaignButton}
          />
        )}
        <AccountSummaryWidget />
        {showLinkIcon && (
          <>
            <Divider direction="vertical" className="oui-h-8" intensity={8} />
            <LinkDeviceWidget />
          </>
        )}
        <LanguageSwitcherWidget />
        {isDesktop && <ChainMenuWidget />}
        {!hideWalletConnectButton && <WalletConnectButtonExtension />}
      </Flex>
    </Flex>
  );
};

MainNav.displayName = "MainNav";
