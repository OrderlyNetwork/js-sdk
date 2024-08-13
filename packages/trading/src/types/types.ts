import type { TradingPageProps as OldTradingPageProps } from "@orderly.network/react";

export type layoutInfo = {
  width?: number;
  height?: number;
  // padding?: number;
  // margin?: number;
  fontSize?: number;

  color?: string;
  textAlign?: CanvasTextAlign;
  textBaseline?: CanvasTextBaseline;
  position: Partial<{
    left: number;
    right: number;
    top: number;
    bottom: number;
  }>;
};

export type PosterLayoutConfig = {
  message?: layoutInfo;

  domain?: layoutInfo;
  position?: layoutInfo;
  unrealizedPnl?: layoutInfo & {
    secondaryColor: string;
    secondaryFontSize: number;
  };

  informations?: layoutInfo & {
    labelColor?: string;
  };
  updateTime?: layoutInfo;
};

export type ShareOptions = {
  pnl: {
    /**
     * defualt is Manrope
     */
    fontFamily?: string;
    /**
     * can not empty
     */
    backgroundImages: string[];
    /**
     * posterLayoutConfig
     */
    layout?: PosterLayoutConfig;
    // normal text color
    /**
     * norma text color, default is  "rgba(255, 255, 255, 0.98)"
     */
    color?: string;
    /**
     * profit text color, default is "rgb(0,181,159)"
     */
    profitColor?: string;
    /**
     * loss text color, default is  "rgb(255,103,194)"
     */
    lossColor?: string;
    /**
     * brand color, default is "rgb(0,181,159)"
     */
    brandColor?: string;
  };
};

export type ReferralProps = {
  saveRefCode?: boolean;
  onClickReferral?: () => void;
  onBoundRefCode?: (success: boolean, error: any) => void;
  refLink?: string;
  slogan?: string;
};

export type TradingRewardProps = {
  onClickTradingReward?: () => void;
};

export type TradingPageProps = OldTradingPageProps & {
  shareOptions: ShareOptions;
  referral: ReferralProps;
  tradingReward: TradingRewardProps;
};
