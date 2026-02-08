import { useMemo } from "react";
import { i18n, useTranslation } from "@orderly.network/i18n";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import {
  EarnIcon,
  TradingIcon,
  SettingFillIcon,
  BarChartIcon,
  PersonIcon,
  SpotIcon,
  LeftNavVaultsIcon,
  WoofiStakeIcon,
  ReferralSolidIcon,
  BattleSolidInactiveIcon,
  AssetIcon,
} from "@orderly.network/ui";
import { LeftNavProps, MainNavWidgetProps } from "@orderly.network/ui-scaffold";
import { PathEnum } from "../playground/constant";
import {
  CustomArenaButtonMain,
  CustomArenaButtonLeft,
  MainNavCustomRenderOptions,
} from "./components/customArenButton";
import { customEarnSubMenuRender } from "./components/customEarnSubMenu";
import { customTradeSubMenuRender } from "./components/customTradeSubMenu";

const isOnGoing = true; // mock isOnGoing status for storybook

export const customArenRender = (
  variant: "mainNav" | "leftNav" = "mainNav",
) => {
  if (isOnGoing) {
    return (options: MainNavCustomRenderOptions) => {
      if (variant === "leftNav") {
        return (
          <div
            style={{
              marginTop: -12,
              marginBottom: -12,
              marginLeft: -12,
              marginRight: -12,
            }}
          >
            <CustomArenaButtonLeft
              className={"after:oui-bg-base-8"}
              routeOptions={options}
              showIcon={true}
            />
          </div>
        );
      } else {
        return (
          <CustomArenaButtonMain
            className={"after:oui-bg-base-9"}
            routeOptions={options}
            showIcon={false}
          />
        );
      }
    };
  }
};

const getMainMenus = (): MainNavWidgetProps["mainMenus"] => {
  return [
    {
      name: i18n.t("extend.spot"),
      href: PathEnum.Swap,
      className: "oui-hidden",
    },
    {
      name: i18n.t("common.trading"),
      href: "/",
      activeHrefs: [PathEnum.Swap],
      isHomePageInMobile: true,
      customSubMenuRender: customTradeSubMenuRender(),
    },
    {
      label: i18n.t("extend.earn"),
      name: i18n.t("extend.vaults"),
      href: "/vaults",
      isSubMenuInMobile: true,
      subMenuBackNav: { href: PathEnum.Perp, name: i18n.t("common.trading") },
      disabled: true,
      className: "oui-cursor-pointer",
      customSubMenuRender: customEarnSubMenuRender(),
    },
    { name: i18n.t("common.markets"), href: "/markets" },
    { name: i18n.t("common.portfolio"), href: "/portfolio" },
    {
      name: i18n.t("affiliate.referral"),
      href: "/rewards/affiliate",
      onlyInMainAccount: true,
      tooltipConfig: {
        showOnFirstVisit: true,
        text: i18n.t("affiliate.referralTooltip"),
      },
      isSubMenuInMobile: true,
      subMenuBackNav: {
        name: "portfolio",
        href: PathEnum.Portfolio,
      },
    },
    {
      name: i18n.t("tradingLeaderboard.arena"),
      href: "/leaderboard",
      customRender: customArenRender("mainNav"),
    },
    {
      name: i18n.t("tradingPoints.points"),
      href: "/points",
    },
    {
      name: i18n.t("tradingView.timeInterval.more"),
      href: "",
      children: [
        {
          name: i18n.t("portfolio.feeTier"),
          href: PortfolioLeftSidebarPath.FeeTier,
        },
        {
          name: i18n.t("portfolio.apiKeys"),
          href: PortfolioLeftSidebarPath.ApiKey,
        },
        {
          name: i18n.t("portfolio.setting"),
          href: PortfolioLeftSidebarPath.Setting,
        },
        {
          name: i18n.t("extend.dashboard"),
          href: "https://woofi.com/swap/dashboard",
        },
        {
          name: i18n.t("extend.spotDune"),
          href: "https://dune.com/woofianalytics/woofi-dashboard",
          target: "_blank",
        },
        {
          name: i18n.t("extend.perpsDune"),
          href: "https://dune.com/woofianalytics/woofi-pro",
          target: "_blank",
        },
        {
          name: i18n.t("extend.careers"),
          href: "https://job-boards.greenhouse.io/woofi",
          target: "_blank",
        },
        {
          name: i18n.t("extend.docs"),
          href: "https://learn.woo.org/",
          target: "_blank",
        },
        {
          name: i18n.t("extend.audits"),
          href: "https://learn.woo.org/woofi-docs/woofi-dev-docs/references/audits-and-bounties",
          target: "_blank",
        },
      ],
    },
  ];
};

const getLeftNavMenus = (): LeftNavProps => {
  return {
    menus: [
      {
        name: i18n.t("extend.spot"),
        href: PathEnum.Swap,
        icon: <SpotIcon />,
      },
      {
        name: i18n.t("extend.perps"),
        href: "/",
        icon: <TradingIcon />,
      },
      {
        name: i18n.t("extend.earn"),
        href: "https://woofi.com/swap/earn",
        icon: <EarnIcon />,
      },
      {
        name: i18n.t("common.assets"),
        href: "/portfolio/assets",
        icon: <AssetIcon />,
      },
      {
        name: i18n.t("extend.vaults"),
        href: "/vaults",
        icon: <LeftNavVaultsIcon />,
      },
      {
        name: i18n.t("extend.stake"),
        href: "https://woofi.com/swap/stake",
        icon: <WoofiStakeIcon />,
      },
      {
        name: i18n.t("common.markets"),
        href: "/markets",
        icon: <BarChartIcon />,
      },
      {
        name: i18n.t("common.portfolio"),
        href: "/portfolio",
        icon: <PersonIcon />,
      },
      {
        name: i18n.t("affiliate.referral"),
        href: "/rewards/affiliate",
        icon: <ReferralSolidIcon />,
        // trailing: <Tag text="Unlock @ $10K volume" />,
        onlyInMainAccount: true,
      },
      {
        name: i18n.t("tradingLeaderboard.arena"),
        href: "/leaderboard",
        icon: <BattleSolidInactiveIcon />,
        customRender: customArenRender("leftNav"),
      },
      // {
      //   name: i18n.t("common.tradingRewards"),
      //   href: "/rewards/trading",
      //   icon: <TradingLeftNavIcon width={24} height={24} opacity={0.8} />,
      // },
      {
        name: i18n.t("common.settings"),
        href: "/portfolio/setting",
        icon: <SettingFillIcon color="white" opacity={0.8} />,
      },
      {
        name: "Orderly App",
        href: "https://app.orderly.network",
        target: "_blank",
      },
      {
        name: i18n.t("notification.title"),
        href: "/announcement",
        isSecondary: true,
      },
      {
        name: i18n.t("portfolio.feeTier"),
        href: "/portfolio/fee",
        isSecondary: true,
      },
      {
        name: i18n.t("portfolio.apiKeys"),
        href: "/portfolio/api-key",
        isSecondary: true,
      },
      {
        name: i18n.t("extend.dashboard"),
        href: "https://woofi.com/swap/dashboard",
        isSecondary: true,
      },
      {
        name: i18n.t("extend.spotDune"),
        href: "https://dune.com/woofianalytics/woofi-dashboard",
        target: "_blank",
        isSecondary: true,
      },
      {
        name: i18n.t("extend.perpsDune"),
        href: "https://dune.com/woofianalytics/woofi-pro",
        target: "_blank",
        isSecondary: true,
      },
      {
        name: i18n.t("extend.careers"),
        href: "https://job-boards.greenhouse.io/woofi",
        target: "_blank",
        isSecondary: true,
      },
      {
        name: i18n.t("extend.docs"),
        href: "https://learn.woo.org/",
        target: "_blank",
        isSecondary: true,
      },
      {
        name: i18n.t("extend.audits"),
        href: "https://learn.woo.org/woofi-docs/woofi-dev-docs/references/audits-and-bounties",
        target: "_blank",
        isSecondary: true,
      },
    ],
    twitterUrl: "https://twitter.com/OrderlyNetwork",
    telegramUrl: "https://t.me/orderlynetwork",
    discordUrl: "https://discord.com/invite/orderlynetwork",
    feedbackUrl: "https://orderly.network/feedback",
  };
};

const getMainNavProp = (): MainNavWidgetProps => {
  return {
    // leading: <CustomProductNav />,
    trailing: null,
    initialMenu: "/",
    mainMenus: getMainMenus(),
    leftNav: getLeftNavMenus(),
  };
};

export const useMainNav = () => {
  const { t } = useTranslation();
  // it need to add t to the dependency array to ensure the mainNav is re-rendered when the language is changed
  return useMemo(() => getMainNavProp(), [t]);
};
