import { Box, ExtensionPositionEnum, ExtensionSlot } from "@orderly.network/ui";
import { LayoutProvider } from "./context";
import {
  Scaffold,
  SideBar,
  SideBarProps,
  useScaffoldContext,
} from "@orderly.network/ui-scaffold";
import { PropsWithChildren } from "react";

export type TradingRewardsLayoutProps = {
  hideSideBar?: boolean;
} & SideBarProps;

export const TradingRewardsLayout = (
  props: PropsWithChildren<TradingRewardsLayoutProps>
) => {
  const { ...rest } = props;
  return (
    <Scaffold
      leftSidebar={props.hideSideBar ? undefined : <LeftSidebar {...rest} />}
      routerAdapter={{
        onRouteChange: (path: string) => {
          console.log("on route change", path);
          
        },
        currentPath: "trading",
      }}
    >
      <Box mx={3} my={6}>
        {props.children}
      </Box>
    </Scaffold>
  );
  // return (
  //   <LayoutProvider>
  //     <div className="oui-h-dvh">
  //       <ExtensionSlot position={ExtensionPositionEnum.MainNav} />
  //       <div
  //         className="oui-grid oui-h-full"
  //         style={{ gridAutoColumns: "160px 1fr" }}
  //       >
  //         <Box p={4} className="oui-bg-base-9 oui-rounded-2xl">
  //           <ExtensionSlot position={ExtensionPositionEnum.SideNav} />
  //         </Box>
  //         <div></div>
  //       </div>
  //     </div>
  //   </LayoutProvider>
  // );
};

const LeftSidebar = (props: SideBarProps) => {
  const { expanded, setExpand } = useScaffoldContext();

  return (
    // 、、 p={4} border borderColor={8} r={"xl"}height={"100%"}
    <div  className="oui-m-3 oui-p-4 oui-broder oui-border-[1px] oui-border-line oui-rounded-xl oui-h-[calc(100%-29px)]">
      <SideBar
        {...props}
        open={expanded}
        onOpenChange={(open) => setExpand(open)}
      />
    </div>
  );
};
