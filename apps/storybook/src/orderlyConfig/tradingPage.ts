import type { TradingPageProps } from "@veltodefi/trading";

export type TradingPageConfigProps = {
  tradingViewConfig: Partial<TradingPageProps["tradingViewConfig"]>;
  sharePnLConfig: TradingPageProps["sharePnLConfig"];
  referral?: any;
};

export const tradingPageConfig: TradingPageConfigProps = {
  tradingViewConfig: {
    // scriptSRC: "/tradingview/charting_library/charting_library.js",
    // library_path: "/tradingview/charting_library/",
    // customCssUrl: "/tradingview/chart.css",
    // broker config tradingview bg
    // colorConfig: {
    //   downColor: '#BE1630',
    //   upColor: '#373d36',
    //   pnlDownColor: '#BE1630',
    //   pnlUpColor: '#53B049',
    //   // chartBG: '#BE1630',
    //   chartBG: '#6a64ed',
    // },
    // disabled_features: ["mouse_wheel_scale"],
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
};
