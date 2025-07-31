import { FC, ReactNode } from "react";
import {
  RouteOption,
  Scaffold,
  ScaffoldProps,
} from "@orderly.network/ui-scaffold";
import { useOrderlyConfig } from "../../hooks/useOrderlyConfig";
import { onStorybookRounteChange } from "../../hooks/useStorybookNav";

type BaseLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
  classNames?: ScaffoldProps["classNames"];
  topBar?: ReactNode;
};

export const BaseLayout: FC<BaseLayoutProps> = (props) => {
  return (
    <CommonBaseLayout onRouteChange={onStorybookRounteChange}>
      {props.children}
    </CommonBaseLayout>
  );
};

type CommonBaseLayoutProps = BaseLayoutProps & {
  onRouteChange: (option: RouteOption) => void;
};

export const CommonBaseLayout: FC<CommonBaseLayoutProps> = (props) => {
  const config = useOrderlyConfig({ onRouteChange: props.onRouteChange });

  return (
    <Scaffold
      topBar={props.topBar}
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: props.initialMenu || "/",
        // customRender: useCustomRender(),
      }}
      bottomNavProps={{
        ...config.scaffold.bottomNavProps,
      }}
      footerProps={config.scaffold.footerProps}
      routerAdapter={{ onRouteChange: props.onRouteChange }}
      classNames={props.classNames}
    >
      {props.children}
    </Scaffold>
  );
};
