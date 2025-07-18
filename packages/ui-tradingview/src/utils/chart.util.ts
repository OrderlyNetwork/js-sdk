import { ColorConfigInterface } from "../tradingviewAdapter/type";

const upColor = "#008676";
const downColor = "#D92D6B";
export const chartBG = "#131519";
const pnlUpColor = "#00B49E";
const pnlDownColor = "#FF447C";
const pnlZoreColor = "#333948";
const textColor = "#FFFFFF";
const qtyTextColor = "#F4F7F9";
const font = "regular 11px Manrope";

export const defaultColorConfig: ColorConfigInterface = {
  upColor,
  downColor,
  chartBG,
  pnlUpColor,
  pnlDownColor,
  pnlZoreColor,
  textColor,
  qtyTextColor,
  font,
  volumeUpColor: "#0C3E3A",
  volumeDownColor: "#5A1E36",
  closeIcon: "rgba(255, 255, 255, 0.8)",
};

export const getOveriides = (
  colorConfig: ColorConfigInterface,
  isMobile?: boolean,
) => {
  const overrides = {
    "paneProperties.background": colorConfig.chartBG,
    // "paneProperties.background": "#ffff00",
    // "mainSeriesProperties.style": 1,
    "paneProperties.backgroundType": "solid",
    // "paneProperties.background": "#151822",

    "mainSeriesProperties.candleStyle.upColor": colorConfig.upColor,
    "mainSeriesProperties.candleStyle.downColor": colorConfig.downColor,
    "mainSeriesProperties.candleStyle.borderColor": colorConfig.upColor,
    "mainSeriesProperties.candleStyle.borderUpColor": colorConfig.upColor,
    "mainSeriesProperties.candleStyle.borderDownColor": colorConfig.downColor,
    "mainSeriesProperties.candleStyle.wickUpColor": colorConfig.upColor,
    "mainSeriesProperties.candleStyle.wickDownColor": colorConfig.downColor,
    "paneProperties.separatorColor": "#2B2833",
    "paneProperties.vertGridProperties.color": "#26232F",
    "paneProperties.horzGridProperties.color": "#26232F",
    "scalesProperties.fontSize": isMobile ? 8 : 12,
    "scalesProperties.textColor": "#97969B",
    "paneProperties.legendProperties.showSeriesTitle": isMobile ? false : true,
    "mainSeriesProperties.statusViewStyle.symbolTextSource": "ticker",
  };
  const studiesOverrides = {
    "volume.volume.color.0": colorConfig.volumeDownColor,
    "volume.volume.color.1": colorConfig.volumeUpColor,
  };

  return {
    overrides,
    studiesOverrides,
  };
};

export const EXCHANGE = "Orderly";
export const withoutExchangePrefix = (symbol: string) =>
  symbol.includes(":") ? symbol.split(":")[1] : symbol;

export const withExchangePrefix = (symbol: string) =>
  symbol.startsWith(`${EXCHANGE}:`) ? symbol : `${EXCHANGE}:${symbol}`;
