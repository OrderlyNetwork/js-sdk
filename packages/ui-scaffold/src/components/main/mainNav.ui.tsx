import { FC, PropsWithChildren, useMemo } from "react";
import { MainNavClassNames, MainNavItemsProps } from "./mainNavItems";

import { ProductsMenu, ProductsProps } from "./products";
import { cn, Divider, Flex } from "@orderly.network/ui";
import type { LogoProps } from "@orderly.network/ui";
import { AccountMenuWidget } from "../accountMenu";
import { AccountSummaryWidget } from "../accountSummary";
import { ChainMenuWidget } from "../chainMenu";
import { CampaignPositionEnum } from "./useWidgetBuilder.script";
import { CampaignButton, CampaignProps } from "./campaignButton";
import { MainLogo } from "./mainLogo";
import { MainNavMenusExtension } from "./mainMenus/mainNavMenus.widget";
import { WalletConnectButtonExtension } from "../accountMenu/menu.widget";
import { LinkDeviceIcon } from "../icons";
import { AccountStatusEnum } from "@orderly.network/types";

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
  showQRCode?: () => void;
};

export const MainNav: FC<PropsWithChildren<MainNavProps>> = (props) => {
  const { className, logo, products, classNames, campaigns, campaignPosition } =
    props;

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
      className={cn(
        "oui-main-nav oui-font-semibold",
        className,
        classNames?.root
      )}
    >
      <Flex itemAlign={"center"} gap={4}>
        <MainLogo {...logo} />
        <ProductsMenu {...products} className={classNames?.products} />
        {/* <MainNavItems {...props.mainMenus} classNames={classNames?.mainNav} /> */}
        <MainNavMenusExtension
          {...props.mainMenus}
          classNames={classNames?.mainNav}
        />
      </Flex>
      {children}

      <Flex itemAlign={"center"} gap={4}>
        {campaignPosition === CampaignPositionEnum.navTailing && campaigns ? (
          <CampaignButton
            {...campaigns}
            className={classNames?.campaignButton}
          />
        ) : null}
        <AccountSummaryWidget />
        {props.status! >= AccountStatusEnum.SignedIn && (
          <>
            <Divider direction="vertical" className="oui-h-8" intensity={8} />
            <LinkDeviceIcon
              className="oui-text-base-contrast-80 oui-cursor-pointer"
              onClick={props.showQRCode}
            />
          </>
        )}
        <ChainMenuWidget />
        {props.wrongNetwork && props.isConnected ? null : (
          <WalletConnectButtonExtension />
        )}
      </Flex>
    </Flex>
  );
};

MainNav.displayName = "MainNav";
