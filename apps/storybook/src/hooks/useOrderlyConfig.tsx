import { useMemo } from "react";
import { RestrictedInfoOptions } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { AppLogos } from "@orderly.network/react-app";
import { TradingPageProps } from "@orderly.network/trading";
import {
  TradingIcon,
  TradingActiveIcon,
  TradingInactiveIcon,
  PortfolioActiveIcon,
  PortfolioInactiveIcon,
  LeaderboardActiveIcon,
  LeaderboardInactiveIcon,
  SettingFillIcon,
  MarketsActiveIcon,
  MarketsInactiveIcon,
  useScreen,
  BarChartIcon,
  PersonIcon,
  BattleIcon,
  AssetIcon,
  TradingLeftNavIcon,
  Text,
} from "@orderly.network/ui";
import {
  FooterProps,
  MainNavWidgetProps,
  BottomNavProps,
} from "@orderly.network/ui-scaffold";
import {
  AffiliatesActiveIcon,
  AffiliatesIcon,
  OrderlyActiveIcon,
  OrderlyIcon,
  TradingRewardsActiveIcon,
  TradingRewardsIcon,
} from "../components/icons";

export type OrderlyConfig = {
  orderlyAppProvider: {
    appIcons: AppLogos;
    restrictedInfo?: RestrictedInfoOptions;
  };
  scaffold: {
    mainNavProps: MainNavWidgetProps;
    bottomNavProps: BottomNavProps;
    footerProps: FooterProps;
  };
  tradingPage: {
    tradingViewConfig: TradingPageProps["tradingViewConfig"];
    sharePnLConfig: TradingPageProps["sharePnLConfig"];
    referral?: any;
  };
};

export const useOrderlyConfig = () => {
  const { t } = useTranslation();
  const { isMobile } = useScreen();

  return useMemo<OrderlyConfig>(() => {
    return {
      scaffold: {
        topBar: <></>,
        mainNavProps: {
          // leading: <CustomProductNav />,
          trailing: null,
          mainMenus: [
            { name: t("common.trading"), href: "/", isHomePageInMobile: true },
            { name: t("common.portfolio"), href: "/portfolio" },
            { name: t("common.markets"), href: "/markets" },
            {
              name: t("tradingLeaderboard.arena"),
              href: "/leaderboard",
            },
          ],
          initialMenu: "/",
          campaigns: {
            name: t("tradingRewards.rewards"),
            href: "/rewards",
            icon: "box-ani.gif",
            isSubMenuInMobile: true,
            subMenuBackNav: {
              name: t("common.portfolio"),
              href: "/portfolio",
            },
            children: [
              {
                name: t("common.affiliate"),
                href: "/rewards/affiliate",
                tag: t("extend.affiliate.tag"),
                description: t("extend.affiliate.description"),
                icon: <AffiliatesIcon size={14} />,
                activeIcon: <AffiliatesActiveIcon size={14} />,
              },
              {
                name: t("common.tradingRewards"),
                href: "/rewards/trading",
                description: t("extend.tradingRewards.description"),
                icon: <TradingRewardsIcon size={14} />,
                activeIcon: <TradingRewardsActiveIcon size={14} />,
              },
              {
                name: t("extend.staking"),
                href: "https://app.orderly.network/staking",
                description: t("extend.staking.description"),
                target: "_blank",
                icon: <OrderlyIcon size={14} />,
                activeIcon: <OrderlyActiveIcon size={14} />,
              },
            ],
          },
          leftNav: {
            menus: [
              { name: t("common.trading"), href: "/", icon: <TradingIcon /> },
              {
                name: t("common.markets"),
                href: "/markets",
                icon: <BarChartIcon />,
              },
              {
                name: t("common.portfolio"),
                href: "/portfolio",
                icon: <PersonIcon />,
              },
              {
                name: t("common.assets"),
                href: "/portfolio/assets",
                icon: <AssetIcon />,
              },
              {
                name: t("tradingLeaderboard.arena"),
                href: "/leaderboard",
                icon: <BattleIcon />,
              },
              {
                name: t("common.affiliate"),
                href: "/rewards/affiliate",
                icon: <img src="box-ani.gif" className="oui-w-6 oui-h-6" />,
                trailing: <Tag text="Unlock @ $10K volume" />,
              },
              {
                name: t("common.tradingRewards"),
                href: "/rewards/trading",
                icon: (
                  <TradingLeftNavIcon width={24} height={24} opacity={0.8} />
                ),
              },
              {
                name: t("common.settings"),
                href: "/portfolio/settings",
                icon: <SettingFillIcon color="white" opacity={0.8} />,
              },
            ],
            twitterUrl: "https://twitter.com/OrderlyNetwork",
            telegramUrl: "https://t.me/orderlynetwork",
            discordUrl: "https://discord.com/invite/orderlynetwork",
            duneUrl: "https://dune.com/orderlynetwork",
            feedbackUrl: "https://orderly.network/feedback",
          },
        },
        bottomNavProps: {
          mainMenus: [
            {
              name: t("common.markets"),
              href: "/markets",
              activeIcon: <MarketsActiveIcon />,
              inactiveIcon: <MarketsInactiveIcon />,
            },
            {
              name: t("common.trading"),
              href: "/",
              activeIcon: <TradingActiveIcon />,
              inactiveIcon: <TradingInactiveIcon />,
            },
            {
              name: t("tradingLeaderboard.arena"),
              href: "/leaderboard",
              activeIcon: <LeaderboardActiveIcon />,
              inactiveIcon: <LeaderboardInactiveIcon />,
            },
            {
              name: t("common.portfolio"),
              href: "/portfolio",
              activeIcon: <PortfolioActiveIcon />,
              inactiveIcon: <PortfolioInactiveIcon />,
            },
          ],
        },
        footerProps: {
          telegramUrl: "https://orderly.network",
          discordUrl: "https://discord.com/invite/orderlynetwork",
          twitterUrl: "https://twitter.com/OrderlyNetwork",
        },
        leftNavProps: {
          items: [
            {
              name: t("common.trading"),
              href: "/",
              icon: <TradingActiveIcon />,
            },
            {
              name: t("common.markets"),
              href: "/markets",
              icon: <MarketsActiveIcon />,
            },
            {
              name: t("common.portfolio"),
              href: "/portfolio",
              icon: <PortfolioActiveIcon />,
            },
            { name: t("common.assets"), href: "/portfolio/assets", icon: "" },
            {
              name: t("common.leaderboard"),
              href: "/leaderboard",
              icon: <LeaderboardActiveIcon />,
            },
            {
              name: t("common.affiliate"),
              href: "/rewards/affiliate",
              icon: "",
            },
            {
              name: t("common.tradingRewards"),
              href: "/rewards/trading",
              icon: "",
            },
            {
              name: t("common.settings"),
              href: "/portfolio/settings",
              icon: "",
            },
          ],
        },
      },
      orderlyAppProvider: {
        appIcons: {
          main: {
            component: <img src="/orderly-logo.svg" style={{ height: 40 }} />,
          },
          secondary: {
            img: "/orderly-logo-secondary.svg",
          },
        },
        restrictedInfo: {
          enableDefault: true,
          customRestrictedIps: [],
          customRestrictedRegions: [],
          // content: ({ ip, brokerName }) =>
          //   `You are accessing ${brokerName} from an IP address (${ip}) associated with a restricted country. Please refer to our Terms of Use</0>. If you believe this is an error, contact x@orerly.network.`,
        },
      },
      tradingPage: {
        tradingViewConfig: {
          scriptSRC: "/tradingview/charting_library/charting_library.js",
          library_path: "/tradingview/charting_library/",
          customCssUrl: "/tradingview/chart.css",
          // broker config tradingview bg
          // colorConfig: {
          //   downColor: '#BE1630',
          //   upColor: '#373d36',
          //   pnlDownColor: '#BE1630',
          //   pnlUpColor: '#53B049',
          //   // chartBG: '#BE1630',
          //   chartBG: '#6a64ed',
          // },
        },
        sharePnLConfig: {
          backgroundImages: [
            "/pnl/poster_bg_1.png",
            "/pnl/poster_bg_2.png",
            "/pnl/poster_bg_3.png",
            "/pnl/poster_bg_4.png",
          ],

          color: "rgba(255, 255, 255, 0.98)",
          profitColor: "rgba(41, 223, 169, 1)",
          lossColor: "rgba(245, 97, 139, 1)",
          brandColor: "rgba(255, 255, 255, 0.98)",

          // ref
          refLink: "https://orderly.network",
          refSlogan: "NEW BE222",
        },
      },
    };
  }, [t]);
};

const Tag = (props: { text: string }) => {
  return (
    <div
      className={
        "oui-ml-1 oui-inline-flex oui-rounded oui-bg-gradient-to-r oui-from-[rgb(var(--oui-gradient-brand-start)_/_0.12)] oui-to-[rgb(var(--oui-gradient-brand-end)_/_0.12)] oui-px-2 oui-py-1"
      }
    >
      <Text.gradient
        color={"brand"}
        size={"3xs"}
        className="oui-whitespace-nowrap oui-break-normal"
      >
        {props.text}
      </Text.gradient>
    </div>
  );
};
