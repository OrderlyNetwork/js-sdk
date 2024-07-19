import { Box, ExtensionPositionEnum, ExtensionSlot } from "@orderly.network/ui";
import { LayoutProvider } from "./context";
import {
  Scaffold,
  SideBar,
  SideBarProps,
  SideMenuItem,
  useScaffoldContext,
} from "@orderly.network/ui-scaffold";
import { PropsWithChildren } from "react";
import { LayoutProps } from "@orderly.network/ui-scaffold";

export type TradingRewardsLayoutProps = {
  hideSideBar?: boolean;
  onClickMenuItem?: (item: SideMenuItem) => void;
} & SideBarProps &
  LayoutProps;

export const TradingRewardsLayout = (
  props: PropsWithChildren<TradingRewardsLayoutProps>
) => {
  const { ...rest } = props;

  return (
    <Scaffold
      leftSidebar={props.hideSideBar ? (<></>) : <LeftSidebar {...rest} />}
      routerAdapter={props.routerAdapter}
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

const LeftSidebar = (props: SideBarProps & {
  onClickMenuItem?: (item: SideMenuItem) => void;

} & LayoutProps) => {
  const { expanded, setExpand } = useScaffoldContext();

  console.log("sidebar", props.onItemSelect);

  return (
    <div className="oui-m-3 oui-p-4 oui-broder oui-border-[1px] oui-border-line oui-rounded-xl oui-h-[calc(100%-29px)]">
      <SideBar
        {...props}
        open={expanded}
        onOpenChange={(open) => setExpand(open)}
        onItemSelect={(a) => {
          console.log("xxxxxxx a,",a);
          props.onItemSelect?.(a);
          // props.onClickMenuItem?.(a);
          props.routerAdapter?.onRouteChange?.({
            href: a.href || "" ,
            name: a.name,
          });
        }}
      />
    </div>
  );
};
