import { Box } from "@orderly.network/ui";
import {
  LayoutProps,
  Scaffold,
  SideBar,
  SideBarProps,
  useScaffoldContext,
} from "@orderly.network/ui-scaffold";
import { PropsWithChildren } from "react";

export type PortfolioLayoutProps = {
  hideSideBar?: boolean;
} & SideBarProps &
  LayoutProps;

export const PortfolioLayout = (
  props: PropsWithChildren<PortfolioLayoutProps>
) => {
  const { children, ...rest } = props;

  return (
    <Scaffold
      leftSidebar={props.hideSideBar ? <></> : <LeftSidebar {...rest} />}
      routerAdapter={props.routerAdapter}
      classNames={{
        topNavbar: "oui-bg-base-9"
      }}
      {...props}
    >
      <Box mx={3} my={6}>
        {children}
      </Box>
    </Scaffold>
  );
};

const LeftSidebar = (props: SideBarProps & LayoutProps) => {
  const { expanded, setExpand } = useScaffoldContext();

  return (
    <Box p={4} m={3} border borderColor={8} r={"xl"} height={"100%"} className="oui-bg-base-9">
      <SideBar
        title="Portfolio"
        {...props}
        open={expanded}
        onOpenChange={(open) => setExpand(open)}
        onItemSelect={(e) => {
          props.onItemSelect?.(e);
          props.routerAdapter?.onRouteChange?.({
            href: e.href || "",
            name: e.name,
          });
        }}
      />
    </Box>
  );
};
