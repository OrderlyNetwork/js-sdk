import { FC, ReactNode } from "react";
import { Flex, useScreen } from "@orderly.network/ui";
import { Scaffold, ScaffoldProps } from "@orderly.network/ui-scaffold";
import { useNav } from "../../hooks/useNav";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";

type BaseLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
  topBar?: ReactNode;
};

export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  const { onRouteChange } = useNav();
  const config = useOrderlyConfig();
  const { isMobile } = useScreen();

  return (
    <Scaffold
      topBar={props.topBar}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: props.initialMenu || "/",
        customRender: (components) => {
          // mobile
          if (isMobile) {
            return (
              <Flex width="100%" justify="between">
                <Flex gapX={2}>
                  {components.leftNav}
                  {components.title}
                </Flex>

                <Flex gapX={2}>
                  {components.languageSwitcher}
                  {components.scanQRCode}
                  {components.linkDevice}
                  {components.chainMenu}
                  {components.walletConnect}
                </Flex>
              </Flex>
            );
          }

          // desktop
          return (
            <Flex width="100%" justify="between">
              <Flex gapX={2}>
                {components.title}
                {components.mainNav}
              </Flex>

              <Flex gapX={2}>
                {components.accountSummary}
                {components.linkDevice}
                {components.languageSwitcher}
                {components.subAccount}
                {components.chainMenu}
                {components.walletConnect}
              </Flex>
            </Flex>
          );
        },
      }}
      bottomNavProps={{
        ...config.scaffold.bottomNavProps,
      }}
      footerProps={config.scaffold.footerProps}
      routerAdapter={{
        onRouteChange,
      }}
      classNames={props.classNames}
    >
      {props.children}
    </Scaffold>
  );
};
