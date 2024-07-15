import { Box, ExtensionPositionEnum, ExtensionSlot } from "@orderly.network/ui";
import {
  Scaffold,
  SideBar,
  SideBarProps,
  useScaffoldContext,
} from "@orderly.network/ui-scaffold";
import { PropsWithChildren } from "react";

export type PortfolioLayoutProps = {
  // sideOpen?: boolean;
} & SideBarProps;

export const PortfolioLayout = (
  props: PropsWithChildren<PortfolioLayoutProps>
) => {
  const { children, ...rest } = props;

  return (
    <Scaffold leftSidebar={<LeftSidebar {...rest} />}>
      <Box mx={3} my={6}>
        {children}
      </Box>
    </Scaffold>
  );
};

const LeftSidebar = (props: SideBarProps) => {
  const { expanded, setExpand } = useScaffoldContext();

  return (
    <Box p={4} m={3} border borderColor={8} r={"xl"} height={"100%"}>
      <SideBar
        {...props}
        open={expanded}
        onOpenChange={(open) => setExpand(open)}
      />
    </Box>
  );
};
