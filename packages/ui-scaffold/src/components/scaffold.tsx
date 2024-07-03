import { Box, cn, Flex, Grid, type SizeType } from "@orderly.network/ui";
import { MainNavWidget } from "./main/mainNav.widget";
import { PropsWithChildren } from "react";
import { SideNavbarWidget } from "./sidebar";
import { SideBarProps } from "./sidebar/sidebar.ui";
import { createContext } from "react";
import { useState } from "react";
import { useLocalStorage } from "@orderly.network/hooks";

export type routerAdapter = {
  navigate: (path: string) => void;
  currentPath: string;
};

export type LayoutProps = {
  /**
   * Custom left sidebar component,
   * if provided, the layout will use this component over the default sidebar component
   */
  leftSidebar?: React.ReactNode;
  /**
   * Props for the left sidebar, if passed, the layout will use the default sidebar component
   */
  gap?: number;
  bodyPadding?: SizeType;
  leftSideProps?: SideBarProps;
  rightSidebar?: React.ReactNode;
  topbar?: React.ReactNode;
  footer?: React.ReactNode;
  routerAdapter?: routerAdapter;
  footerHeight?: number;
  footerIsSticky?: boolean;
  classNames?: {
    cotent?: string;
    body?: string;
    leftSidebar?: string;
    topNavbar?: string;
    footer?: string;
  };
};

export type ExpandableState = {
  // defaultExpanded?: boolean;
  expanded?: boolean;
  toggleExpanded?: () => void;
};

const ExpandableContext = createContext<ExpandableState>({} as ExpandableState);

export const Scaffold = (props: PropsWithChildren<LayoutProps>) => {
  const { classNames } = props;
  const [expand, setExpand] = useLocalStorage("expand", true);
  const leftSidebar = props.leftSidebar || (
    <SideNavbarWidget {...props.leftSideProps} />
  );

  const onToggleExpanded = () => {
    setExpand(!expand);
  };

  return (
    <ExpandableContext.Provider
      value={{ expanded: expand, toggleExpanded: onToggleExpanded }}
    >
      {/* Top main nav */}
      <Box
        className={cn("oui-border-b oui-border-line-12", classNames?.topNavbar)}
      >
        <MainNavWidget />
      </Box>
      {/*--------- body start ------ */}
      <Grid
        className={cn()}
        style={{
          gridTemplateColumns: `${expand ? "240px" : "60px"} 1fr`,
          gridTemplateRows: "auto 1fr auto",
          gridTemplateAreas: `"left main" "left main" "left main"`,
        }}
      >
        <Box>{leftSidebar}</Box>
        <Box>{props.children}</Box>
      </Grid>
      {/* <Flex
        itemAlign={"start"}
        gap={{ initial: props.gap ?? 0 }}
        className={cn(classNames?.body)}
      >

      </Flex> */}
      {/*--------- body end ------ */}
      {/* <Flex grow></Flex> */}
      {/* Footer */}
      <Box className={cn(classNames?.footer)}>{props.footer}</Box>
    </ExpandableContext.Provider>
  );
};
