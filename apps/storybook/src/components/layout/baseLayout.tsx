import { FC, ReactNode } from "react";
import { Scaffold, ScaffoldProps } from "@orderly.network/ui-scaffold";
import { footerConfig, useBottomNav, useMainNav } from "../../orderlyConfig";
import { PathEnum } from "../../playground/constant";
import { useRouteContext } from "../orderlyProvider/rounteProvider";

type BaseLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
  topBar?: ReactNode;
};

export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  const bottomNavProps = useBottomNav();
  const mainNavProps = useMainNav();

  const { onRouteChange } = useRouteContext();

  return (
    <Scaffold
      topBar={props.topBar}
      mainNavProps={{
        ...mainNavProps,
        initialMenu: props.initialMenu || PathEnum.Root,
        // customRender: useCustomRender(),
      }}
      bottomNavProps={bottomNavProps}
      footerProps={footerConfig}
      routerAdapter={{ onRouteChange }}
      classNames={props.classNames}
    >
      {props.children}
    </Scaffold>
  );
};
