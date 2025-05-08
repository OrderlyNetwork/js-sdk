import { FC, PropsWithChildren } from "react";
import { Flex, Box } from "@orderly.network/ui";
import { MobileTopNav, FooterMobile, LayoutProps } from "@orderly.network/ui-scaffold";

export const PortfolioLayoutMobile: FC<PropsWithChildren<LayoutProps & { current?: string }>> = (props) => {
  console.log("PortfolioLayoutMobile", props);
  return (
    <Flex direction={"column"} width={"100%"} height={"100%"} className="oui-bg-base-10 oui-h-full-screen">
      <header className="oui-w-full oui-sticky oui-top-0 oui-z-10 oui-bg-base-10">
        <MobileTopNav />
      </header>
      <Box className="oui-min-h-[calc(100vh-44px-64px-env(safe-area-inset-bottom))] oui-w-full">{props.children}</Box>
      <footer className="oui-w-full oui-sticky oui-bottom-0 oui-z-10 oui-bg-base-9 oui-pb-[calc(env(safe-area-inset-bottom))]">
        <FooterMobile mainMenus={props.footerProps?.mobileMainMenus} current={props?.current} onRouteChange={props.routerAdapter?.onRouteChange}/>
      </footer>
    </Flex>
  );
};
