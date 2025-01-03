import { TradingPageProps } from "@orderly.network/trading";
import { FooterProps, MainNavWidgetProps } from "@orderly.network/ui-scaffold";
import { AppLogos } from "@orderly.network/react-app";
import { OrderlyActiveIcon, OrderlyIcon } from "./components/icons/orderly";
import { ARBActiveIcon, ARBIcon } from "./components/icons/arb";

export type OrderlyConfig = {
  orderlyAppProvider: {
    appIcons: AppLogos;
  };
  scaffold: {
    mainNavProps: MainNavWidgetProps;
    footerProps: FooterProps;
  };
  tradingPage: {
    tradingViewConfig: TradingPageProps["tradingViewConfig"];
    sharePnLConfig: TradingPageProps["sharePnLConfig"];
    referral?: any;
  };
};

const config: OrderlyConfig = {
  scaffold: {
    mainNavProps: {
      mainMenus: [
        { name: "Trading", href: "/", testid: "oui-main-nav-trading" },
        { name: "Rewards", href: "/rewards", testid: "oui-main-nav-reward" },
        { name: "Markets", href: "/markets", testid: "oui-main-nav-markets" },
      ],
      products: [
        { name: "Swap", href: "/swap" },
        { name: "Trade", href: "/trade" },
      ],
      initialMenu: "/markets",
      initialProduct: "/trade",
      campaigns: {
        name: "Rewards",
        href: "/rewards",
        icon: "box-ani.gif",
        children: [
          {
            name: "Trading rewards",
            href: "/",
            description: "Trade with Orderly to earn ORDER",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.426 1.667c-.184.01-.437.084-.573.192a2 2 0 0 0-.2.192L1.02 7.28a.96.96 0 0 0-.187.528c0 .376.258.603.258.603l8.193 9.592c.006.007.3.335.716.33.417-.008.71-.323.716-.33l8.224-9.626s.227-.298.227-.569c0-.272-.218-.574-.218-.574l-3.592-5.182c-.025-.036-.084-.023-.114-.054-.037-.042-.042-.102-.087-.138-.135-.108-.296-.118-.458-.137-.044-.006-.07-.054-.114-.054h-.087zm1.939 1.757h5.27L10 6.438zm-1.862.603 2.55 2.905H3.468zm8.994 0 2.034 2.905h-4.583zM3.698 8.687h5.385v6.302zm7.219 0h5.385c-1.278 1.494-3.802 4.452-5.385 6.302z"
                  fill="#fff"
                  fillOpacity=".54"
                />
              </svg>
            ),
            activeIcon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="rewardsIcon"
                    x1="17.5"
                    y1="10"
                    x2="2.5"
                    y2="10"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
                    <stop
                      offset="1"
                      stopColor="rgb(var(--oui-gradient-brand-start))"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M5.426 1.667c-.184.01-.437.084-.573.192a2 2 0 0 0-.2.192L1.02 7.28a.96.96 0 0 0-.187.528c0 .376.258.603.258.603l8.193 9.592c.006.007.3.335.716.33.417-.008.71-.323.716-.33l8.224-9.626s.227-.298.227-.569c0-.272-.218-.574-.218-.574l-3.592-5.182c-.025-.036-.084-.023-.114-.054-.037-.042-.042-.102-.087-.138-.135-.108-.296-.118-.458-.137-.044-.006-.07-.054-.114-.054h-.087zm1.939 1.757h5.27L10 6.438zm-1.862.603 2.55 2.905H3.468zm8.994 0 2.034 2.905h-4.583zM3.698 8.687h5.385v6.302zm7.219 0h5.385c-1.278 1.494-3.802 4.452-5.385 6.302z"
                  fill="url(#rewardsIcon)"
                />
              </svg>
            ),
          },
          {
            name: "Trading rewards x2",
            href: "/trading-rewards",
            description:
              "Trade with Orderly to earn ORDER x2 Trade with Orderly to earn ORDER",
            icon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M5.426 1.667c-.184.01-.437.084-.573.192a2 2 0 0 0-.2.192L1.02 7.28a.96.96 0 0 0-.187.528c0 .376.258.603.258.603l8.193 9.592c.006.007.3.335.716.33.417-.008.71-.323.716-.33l8.224-9.626s.227-.298.227-.569c0-.272-.218-.574-.218-.574l-3.592-5.182c-.025-.036-.084-.023-.114-.054-.037-.042-.042-.102-.087-.138-.135-.108-.296-.118-.458-.137-.044-.006-.07-.054-.114-.054h-.087zm1.939 1.757h5.27L10 6.438zm-1.862.603 2.55 2.905H3.468zm8.994 0 2.034 2.905h-4.583zM3.698 8.687h5.385v6.302zm7.219 0h5.385c-1.278 1.494-3.802 4.452-5.385 6.302z"
                  fill="#fff"
                  fillOpacity=".54"
                />
              </svg>
            ),
            activeIcon: (
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <linearGradient
                    id="rewardsIcon"
                    x1="17.5"
                    y1="10"
                    x2="2.5"
                    y2="10"
                    gradientUnits="userSpaceOnUse"
                  >
                    <stop stopColor="rgb(var(--oui-gradient-brand-end))" />
                    <stop
                      offset="1"
                      stopColor="rgb(var(--oui-gradient-brand-start))"
                    />
                  </linearGradient>
                </defs>
                <path
                  d="M5.426 1.667c-.184.01-.437.084-.573.192a2 2 0 0 0-.2.192L1.02 7.28a.96.96 0 0 0-.187.528c0 .376.258.603.258.603l8.193 9.592c.006.007.3.335.716.33.417-.008.71-.323.716-.33l8.224-9.626s.227-.298.227-.569c0-.272-.218-.574-.218-.574l-3.592-5.182c-.025-.036-.084-.023-.114-.054-.037-.042-.042-.102-.087-.138-.135-.108-.296-.118-.458-.137-.044-.006-.07-.054-.114-.054h-.087zm1.939 1.757h5.27L10 6.438zm-1.862.603 2.55 2.905H3.468zm8.994 0 2.034 2.905h-4.583zM3.698 8.687h5.385v6.302zm7.219 0h5.385c-1.278 1.494-3.802 4.452-5.385 6.302z"
                  fill="url(#rewardsIcon)"
                />
              </svg>
            ),
          },
          {
            name: "Affiliate",
            href: "/markets",
            tag: "40% Rebate",
            description: "Earn more as a Orderly affiliate",
          },
          {
            name: "Orderly airdrop",
            href: "https://app.orderly.network",
            description: "Earn Orderly merits by trading on Orderly.",
            target: "_blank",
            icon: <OrderlyIcon size={14} />,
            activeIcon: <OrderlyActiveIcon size={14} />,
          },

          {
            name: "ARB incentives",
            href: "https://app.orderly.network/tradingRewards",
            description: "Trade to win a share of 9,875 ARB each week.",
            target: "_blank",
            icon: <ARBIcon size={14} />,
            activeIcon: <ARBActiveIcon size={14} />,
          },
        ],
      },
    },
    footerProps: {
      telegramUrl: "https://orderly.network",
      discordUrl: "https://discord.com/invite/orderlynetwork",
      twitterUrl: "https://twitter.com/OrderlyNetwork",
    },
  },
  orderlyAppProvider: {
    appIcons: {
      main: {
        img: "/orderly-logo.svg",
      },
      secondary: {
        img: "/orderly-logo-secondary.svg",
      },
    },
  },
  tradingPage: {
    tradingViewConfig: {
      scriptSRC: "/tradingview/charting_library/charting_library.js",
      library_path: "/tradingview/charting_library/",
      customCssUrl: "/tradingview/chart.css",
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

export default config;
