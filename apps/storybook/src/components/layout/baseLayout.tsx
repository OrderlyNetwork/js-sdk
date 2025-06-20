import { FC, ReactNode } from "react";
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

  return (
    <Scaffold
      topBar={props.topBar}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: props.initialMenu || "/",
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
