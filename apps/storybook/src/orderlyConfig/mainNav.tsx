import { useMemo } from "react";
import { i18n, useTranslation } from "@orderly.network/i18n";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
import {
  TradingIcon,
  SettingFillIcon,
  BarChartIcon,
  PersonIcon,
  BattleIcon,
  AssetIcon,
  TradingLeftNavIcon,
  LeftNavVaultsIcon,
} from "@orderly.network/ui";
import { LeftNavProps, MainNavWidgetProps } from "@orderly.network/ui-scaffold";
import { CustomProductNav } from "../components/customProductNav";
import {
  ApiKeys,
  FeeTier,
  TradingRewardsActiveIcon,
  TradingRewardsIcon,
} from "../components/icons";
import {
  CustomArenButton,
  MainNavCustomRenderOptions,
} from "./components/customArenButton";
import { Tag } from "./components/tag";

export function useMainNav() {
  const { t } = useTranslation();
  return useMemo(() => getMainNavProp(), [t]);
}

function getMainNavProp(): MainNavWidgetProps {
  return {
    // leading: <CustomProductNav />,
    trailing: null,
    mainMenus: getMainMenus(),
    initialMenu: "/",
    leftNav: getLeftNavMenus(),
  };
}

// fake ongoing status for demo
const isOnGoing = true;

export function customArenRender() {
  if (isOnGoing) {
    return (options: MainNavCustomRenderOptions) => {
      return (
        <CustomArenButton
          className={"oui-bg-base-9 after:oui-bg-base-9"}
          routeOptions={options}
        />
      );
    };
  }
}

function getMainMenus(): MainNavWidgetProps["mainMenus"] {
  return [
    { name: i18n.t("common.trading"), href: "/", isHomePageInMobile: true },
    { name: i18n.t("common.portfolio"), href: "/portfolio" },
    {
      name: i18n.t("common.vaults"),
      href: "/vaults",
      isSubMenuInMobile: true,
      subMenuBackNav: { href: "/", name: i18n.t("common.trading") },
    },
    { name: i18n.t("common.markets"), href: "/markets" },
    {
      name: i18n.t("tradingLeaderboard.arena"),
      href: "/leaderboard",
      customRender: customArenRender(),
    },
    {
      name: i18n.t("affiliate.referral"),
      href: "/rewards/affiliate",
      icon: "/box-jump.gif",
      onlyInMainAccount: true,
      tooltipConfig: {
        showOnFirstVisit: true,
        text: i18n.t("affiliate.referralTooltip"),
      },
    },
    {
      name: i18n.t("tradingView.timeInterval.more"),
      href: "",
      children: [
        {
          name: i18n.t("common.tradingRewards"),
          href: "/rewards/trading",
          icon: <TradingRewardsIcon size={14} />,
          activeIcon: <TradingRewardsActiveIcon size={14} />,
        },
        {
          name: i18n.t("portfolio.feeTier"),
          href: PortfolioLeftSidebarPath.FeeTier,
          icon: <FeeTier size={14} />,
          activeIcon: <FeeTier size={14} />,
        },
        {
          name: i18n.t("portfolio.apiKeys"),
          href: PortfolioLeftSidebarPath.ApiKey,
          icon: <ApiKeys size={14} />,
          activeIcon: <ApiKeys size={14} />,
        },
      ],
    },
  ];
}

function getLeftNavMenus(): LeftNavProps {
  return {
    menus: [
      { name: i18n.t("common.trading"), href: "/", icon: <TradingIcon /> },
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
        name: i18n.t("common.assets"),
        href: "/portfolio/assets",
        icon: <AssetIcon />,
      },
      {
        name: i18n.t("common.vaults"),
        href: "/vaults",
        icon: <LeftNavVaultsIcon />,
      },
      {
        name: i18n.t("tradingLeaderboard.arena"),
        href: "/leaderboard",
        icon: <BattleIcon />,
        customRender: customArenRender(),
      },
      {
        name: i18n.t("affiliate.referral"),
        href: "/rewards/affiliate",
        icon: (
          <img
            src="/box-jump.gif"
            alt="logo"
            draggable={false}
            className="oui-w-6 oui-h-6"
          />
        ),
        trailing: <Tag text="Unlock @ $10K volume" />,
        onlyInMainAccount: true,
      },
      {
        name: i18n.t("common.tradingRewards"),
        href: "/rewards/trading",
        icon: <TradingLeftNavIcon width={24} height={24} opacity={0.8} />,
      },
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
    ],
    twitterUrl: "https://twitter.com/OrderlyNetwork",
    telegramUrl: "https://t.me/orderlynetwork",
    discordUrl: "https://discord.com/invite/orderlynetwork",
    duneUrl: "https://dune.com/orderlynetwork",
    feedbackUrl: "https://orderly.network/feedback",
  };
}
