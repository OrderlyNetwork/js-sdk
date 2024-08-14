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
      leftSidebar={props.hideSideBar ?null : <LeftSidebar {...rest} />}
      routerAdapter={props.routerAdapter}
      classNames={{
        content: "lg:oui-mb-0",
        topNavbar: "oui-bg-base-9",
        leftSidebar:
          "oui-m-3 oui-p-4 oui-broder oui-border-[1px] oui-border-line oui-rounded-xl oui-bg-base-9",
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
  );
};
