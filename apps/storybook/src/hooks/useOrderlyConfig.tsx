import React, { useMemo } from "react";
import { RestrictedInfoOptions } from "@orderly.network/hooks";
import { useTranslation } from "@orderly.network/i18n";
import { PortfolioLeftSidebarPath } from "@orderly.network/portfolio";
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
  BarChartIcon,
  PersonIcon,
  BattleIcon,
  AssetIcon,
  TradingLeftNavIcon,
  Text,
  cn,
} from "@orderly.network/ui";
import {
  FooterProps,
  MainNavWidgetProps,
  BottomNavProps,
  useScaffoldContext,
  RouteOption,
} from "@orderly.network/ui-scaffold";
import {
  ApiKeys,
  FeeTier,
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

const Battle: React.FC<{ isActive?: boolean }> = (props) => {
  const { isActive = true } = props;
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={16}
      height={16}
      viewBox="0 0 16 16"
      fill="none"
      focusable={false}
    >
      <path
        d="M1.33268 1.3334L1.99935 4.00006L6.30404 8.05215L4.69727 9.75788L4.13737 9.19538L3.19466 10.1381L3.78581 10.7292L2.11393 12.5027L1.80404 12.1954L0.861328 13.1381L2.86133 15.1381L3.80404 14.1954L3.49414 13.8855L5.27018 12.2162L5.86133 12.8048L6.80404 11.862L6.24414 11.3021L7.99935 9.6459L9.74935 11.2943L9.18164 11.862L10.1243 12.8048L10.7207 12.2084L12.4967 13.8777L12.179 14.1954L13.1243 15.1381L15.1243 13.1381L14.1816 12.1954L13.8796 12.4975L12.2077 10.7214L12.791 10.1381L11.8483 9.19538L11.2936 9.75006L9.69466 8.05215L9.69726 8.04954L7.99935 6.25006L3.99935 2.00006L1.33268 1.3334ZM14.666 1.3334L11.9993 2.00006L8.76758 5.43236L10.5645 7.23183L13.9993 4.00006L14.666 1.3334Z"
        fill="url(#paint0_linear_27354_16428)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_27354_16428"
          x1="15.1243"
          y1="8.23574"
          x2="0.861328"
          y2="8.23574"
          gradientUnits="userSpaceOnUse"
        >
          <stop
            stopColor={
              isActive ? "rgb(var(--oui-gradient-brand-end))" : "currentColor"
            }
          />
          <stop
            stopColor={
              isActive ? "rgb(var(--oui-gradient-brand-start))" : "currentColor"
            }
            offset={1}
          />
        </linearGradient>
      </defs>
    </svg>
  );
};

const CustomButton: React.FC<{
  className?: string;
  style?: React.CSSProperties;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}> = (props) => {
  const { t } = useTranslation();
  const { className, style, onClick } = props;
  return (
    <div
      className={cn(
        className,
        "oui-relative oui-z-0 oui-flex oui-cursor-pointer oui-select-none oui-items-center oui-justify-center oui-gap-1 oui-rounded-full oui-border oui-border-solid oui-border-transparent oui-px-3 oui-py-1",
        "before:oui-absolute before:oui-inset-0 before:oui-z-[-1] before:oui-rounded-full before:oui-content-['']",
        "after:oui-absolute after:oui-inset-px after:oui-z-[-1] after:oui-box-border after:oui-rounded-full after:oui-content-['']",
        "oui-gradient-button",
      )}
      style={style}
      onClick={onClick}
    >
      <Battle />
      <Text.gradient
        color={"brand"}
        angle={45}
        className="oui-whitespace-nowrap oui-break-normal oui-text-sm"
      >
        {t("tradingLeaderboard.arena")}
      </Text.gradient>
    </div>
  );
};

const isOnGoing = true; // fake ongoing status for demo

export const useOrderlyConfig = (optins?: {
  onRouteChange?: (option: RouteOption) => void;
}) => {
  const { t } = useTranslation();
  const { routerAdapter } = useScaffoldContext();

  const onRouteChange = routerAdapter?.onRouteChange ?? optins?.onRouteChange;
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
              customRender: isOnGoing
                ? (options) => {
                    return (
                      <CustomButton
                        className={"oui-bg-base-9 after:oui-bg-base-9"}
                        onClick={() => {
                          onRouteChange?.({
                            name: options.name,
                            href: options.href,
                            scope: "mainMenu",
                          });
                        }}
                      />
                    );
                  }
                : undefined,
            },
            {
              name: t("affiliate.referral"),
              href: "/rewards/affiliate",
              icon: "/box-ani.gif",
              onlyInMainAccount: true,
              tooltipConfig: {
                showOnFirstVisit: true,
                text: t("affiliate.referralTooltip"),
              },
            },
            {
              name: t("tradingView.timeInterval.more"),
              href: "",
              children: [
                {
                  name: t("common.tradingRewards"),
                  href: "/rewards/trading",
                  icon: <TradingRewardsIcon size={14} />,
                  activeIcon: <TradingRewardsActiveIcon size={14} />,
                },
                {
                  name: t("portfolio.feeTier"),
                  href: PortfolioLeftSidebarPath.FeeTier,
                  icon: <FeeTier size={14} />,
                  activeIcon: <FeeTier size={14} />,
                },
                {
                  name: t("portfolio.apiKeys"),
                  href: PortfolioLeftSidebarPath.ApiKey,
                  icon: <ApiKeys size={14} />,
                  activeIcon: <ApiKeys size={14} />,
                },
              ],
            },
          ],
          initialMenu: "/",
          campaigns: {
            name: t("affiliate.referral"),
            href: "/rewards",
            icon: "/box-ani.gif",
            isSubMenuInMobile: true,
            subMenuBackNav: {
              name: t("common.portfolio"),
              href: "/portfolio",
            },
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
                customRender: isOnGoing
                  ? (options) => {
                      return (
                        <CustomButton
                          className={"oui-bg-base-8 after:oui-bg-base-8"}
                          onClick={() => {
                            onRouteChange?.({
                              name: options.name,
                              href: options.href,
                              scope: "leftNav",
                            });
                          }}
                        />
                      );
                    }
                  : undefined,
              },
              {
                name: t("affiliate.referral"),
                href: "/rewards/affiliate",
                icon: (
                  <img
                    src="box-ani.gif"
                    alt="logo"
                    draggable={false}
                    className="oui-w-6 oui-h-6"
                  />
                ),
                trailing: <Tag text="Unlock @ $10K volume" />,
                onlyInMainAccount: true,
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
              href: "/portfolio/setting",
              icon: "",
            },
          ],
        },
      },
      orderlyAppProvider: {
        appIcons: {
          main: {
            component: (
              <img
                src="/orderly-logo.svg"
                alt="logo"
                draggable={false}
                style={{ height: 40 }}
              />
            ),
          },
          secondary: {
            img: "/orderly-logo-secondary.svg",
          },
        },
        restrictedInfo: {
          enableDefault: true,
          customRestrictedIps: [],
          customRestrictedRegions: [],
          customUnblockRegions: ["United States"],
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
  }, [t, onRouteChange]);
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
