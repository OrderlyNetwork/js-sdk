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
        // customRender: isMobile
        //   ? (components) => {
        //       return (
        //         <>
        //           {components.title}
        //           <Flex gapX={2}>
        //             {/* hide languageSwitcher on mobile */}
        //             {/* {components.languageSwitcher} */}
        //             {components.scanQRCode}
        //             {components.subAccount}
        //             {components.linkDevice}
        //             {components.chainMenu}
        //             {/* {components.walletConnect} */}
        //           </Flex>
        //         </>
        //       );
        //     }
        //   : undefined,
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
