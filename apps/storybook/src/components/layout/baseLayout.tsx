import { FC, ReactNode } from "react";
import { Scaffold, ScaffoldProps } from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { PathEnum } from "../../playground/constant";
import { useRouteContext } from "../orderlyProvider/rounteProvider";

type BaseLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
  topBar?: ReactNode;
};

export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  const config = useOrderlyConfig();

  const { onRouteChange } = useRouteContext();

  return (
    <Scaffold
      topBar={props.topBar}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: props.initialMenu || PathEnum.Root,
        // customRender: useCustomRender(),
      }}
      bottomNavProps={{
        ...config.scaffold.bottomNavProps,
      }}
      footerProps={config.scaffold.footerProps}
      routerAdapter={{ onRouteChange }}
      classNames={props.classNames}
    >
      {props.children}
    </Scaffold>
  );
};
