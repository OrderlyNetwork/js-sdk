import { FC } from "react";
import { Scaffold } from "@orderly.network/ui-scaffold";
import config from "../../config";
import { useNav } from "../../hooks/useNav";

type OrderlyLayoutProps = {
  children: React.ReactNode;
  initialMenu?: string;
};

export const OrderlyLayout: FC<OrderlyLayoutProps> = (props) => {
  const { onRouteChange } = useNav();
  return (
    <Scaffold
      mainNavProps={{
        ...config.scaffold.mainNavProps,
        initialMenu: props.initialMenu || "/",
      }}
      footerProps={config.scaffold.footerProps}
      routerAdapter={{
        onRouteChange,
      }}
    >
      {props.children}
    </Scaffold>
  );
};
