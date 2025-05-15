import { PropsWithChildren } from "react";
import { useTranslation } from "@orderly.network/i18n";
import { cn } from "@orderly.network/ui";
import {
  RouterAdapter,
  Scaffold,
  SideBar,
  SideBarProps,
  useScaffoldContext,
} from "@orderly.network/ui-scaffold";
import { ScaffoldProps } from "@orderly.network/ui-scaffold";

export type TradingRewardsLayoutProps = ScaffoldProps & {
  hideSideBar?: boolean;
  items?: SideBarProps["items"];
};

export const TradingRewardsLayout = (
  props: PropsWithChildren<TradingRewardsLayoutProps>,
) => {
  const { children, leftSideProps, classNames, ...rest } = props;

  return (
    <Scaffold
      leftSidebar={
        props.hideSideBar ? null : (
          <LeftSidebar
            current={props.routerAdapter?.currentPath}
            routerAdapter={props.routerAdapter}
            items={props.items}
            {...leftSideProps}
          />
        )
      }
      routerAdapter={props.routerAdapter}
      classNames={{
        ...classNames,
        content: classNames?.content,
        topNavbar: cn("oui-bg-base-9", classNames?.topNavbar),
        leftSidebar: cn(
          "oui-rounded-xl oui-bg-base-9",
          "oui-m-3 oui-p-4",
          "oui-border oui-border-line",
          classNames?.leftSidebar,
        ),
      }}
      {...rest}
    >
      {children}
    </Scaffold>
  );
};

type LeftSidebarProps = SideBarProps & {
  routerAdapter?: RouterAdapter;
};

const LeftSidebar = (props: LeftSidebarProps) => {
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
