import { FC, PropsWithChildren } from "react";
import { Box } from "@orderly.network/ui";
import {
  LayoutProps,
  RouterAdapter,
  Scaffold,
  SideBar,
  SideBarProps,
  useScaffoldContext,
} from "@orderly.network/ui-scaffold";

export type PortfolioLayoutProps = LayoutProps & {
  hideSideBar?: boolean;
  /** @deprecated use leftSideProps.items instead */
  items?: SideBarProps["items"];
};

export const PortfolioLayout: FC<PropsWithChildren<PortfolioLayoutProps>> = (
  props
) => {
  const { children, leftSideProps } = props;

  return (
    <Scaffold
      leftSidebar={
        props.hideSideBar ? null : (
          <LeftSidebar
            items={props.items}
            current={props.routerAdapter?.currentPath}
            {...leftSideProps}
            routerAdapter={props.routerAdapter}
          />
        )
      }
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

type LeftSidebarProps = SideBarProps & {
  routerAdapter?: RouterAdapter;
};

const LeftSidebar: FC<LeftSidebarProps> = (props) => {
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
