import { PropsWithChildren } from "react";
import { Box } from "@orderly.network/ui";
import {
  Scaffold,
  SideBar,
  SideBarProps,
  useScaffoldContext,
} from "@orderly.network/ui-scaffold";
import { LayoutProps } from "@orderly.network/ui-scaffold";
import { useTranslation } from "@orderly.network/i18n";

export type TradingRewardsLayoutProps = {
  hideSideBar?: boolean;
} & SideBarProps &
  LayoutProps;

export const TradingRewardsLayout = (
  props: PropsWithChildren<TradingRewardsLayoutProps>
) => {
  const { children, ...rest } = props;

  return (
    <Scaffold
      classNames={{
        content: "lg:oui-mb-0",
        topNavbar: "oui-bg-base-9",
        leftSidebar:
          "oui-m-3 oui-p-4 oui-border oui-border-[1px] oui-border-line oui-rounded-xl oui-bg-base-9",
      }}
      leftSidebar={props.hideSideBar ? null : <LeftSidebar {...rest} />}
      routerAdapter={props.routerAdapter}
      {...props}
    >
      <Box className="oui-flex oui-justify-center">{props.children}</Box>
    </Scaffold>
  );
};

const LeftSidebar = (props: SideBarProps & LayoutProps) => {
  const { t } = useTranslation();
  const { expanded, setExpand } = useScaffoldContext();

  return (
    <SideBar
      title={t("tradingRewards.rewards")}
      {...props}
      open={expanded}
      onOpenChange={(open) => setExpand(open)}
      onItemSelect={(a) => {
        props.onItemSelect?.(a);
        props.routerAdapter?.onRouteChange?.({
          href: a.href || "",
          name: a.name,
        });
      }}
    />
  );
};
