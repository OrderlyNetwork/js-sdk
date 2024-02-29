import { OrderSide } from "@orderly.network/types";
import { PosterPainter } from "./painter";

export type posterDataSource = {
  message?: string;
  position: {
    symbol: string;
    // side: OrderSide;
    side: "LONG" | "SHORT";
    /**
     * The leverage of the position
     */
    leverage: number;
    /**
     * The unrealized PnL of the position
     */
    pnl: number;
    /**
     * The return on investment of the position
     */
    ROI: number;
    /**
     * The informations of the position, such as open price, opened at, mark price, quantity
     */
    informations: { title: string; value: string }[];
    /**
     * The quote currency of the position
     */
    currency: string;
  };
  /**
   * The domain of the application
   */
  domain: string;

  /**
   * The update time of the position
   */
  updateTime: string;
};

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

export type posterLayoutConfig = {
  message?: layoutInfo;

  domain?: layoutInfo;
  position?: layoutInfo;
  unrealizedPnl?: layoutInfo;

  informations?: layoutInfo;
  updateTime?: layoutInfo;
};

export type drawOptions = {
  /**
   * Color of common text
   */
  color?: string;
  /**
   * Lose color
   */
  loseColor?: string;
  /**
   * Profit color
   */
  profitColor?: string;
  /**
   * The brand color of the application
   */
  brandColor?: string;
  backgroundColor?: string;
  backgroundImg?: string;
  data?: posterDataSource;
  layout?: posterLayoutConfig;
};

export abstract class BasePaint {
  constructor(
    protected ctx: CanvasRenderingContext2D,
    protected painter: PosterPainter
  ) {}
  abstract draw(options: drawOptions): Promise<void>;
}
