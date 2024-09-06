const upColor = "#00B59F";
const downColor = "#FB5CB8";
const chartBG = "#16141c";
const pnlUpColor = "#27DEC8";
const pnlDownColor = "#FFA5C0";
const pnlZoreColor = "#808080";
const textColor = "#FFFFFF";
const qtyTextColor = "#F4F7F9";
const font = "regular 11px Manrope";

export const getOveriides = () => {
  const overrides = {
    "paneProperties.background": chartBG,
    // "paneProperties.background": "#ffff00",
    // "mainSeriesProperties.style": 1,
    "paneProperties.backgroundType": "solid",
    // "paneProperties.background": "#151822",

    "mainSeriesProperties.candleStyle.upColor": upColor,
    "mainSeriesProperties.candleStyle.downColor": downColor,
    "mainSeriesProperties.candleStyle.borderColor": upColor,
    "mainSeriesProperties.candleStyle.borderUpColor": upColor,
    "mainSeriesProperties.candleStyle.borderDownColor": downColor,
    "mainSeriesProperties.candleStyle.wickUpColor": upColor,
    "mainSeriesProperties.candleStyle.wickDownColor": downColor,
    "paneProperties.separatorColor": "#2B2833",
    "paneProperties.vertGridProperties.color": "#26232F",
    "paneProperties.horzGridProperties.color": "#26232F",
    "scalesProperties.textColor": "#97969B",
    "paneProperties.legendProperties.showSeriesTitle": false,
  };
  const studiesOverrides = {
    "volume.volume.color.0": "#613155",
    "volume.volume.color.1": "#14494A",
  };

  return {
    overrides,
    studiesOverrides,
  };
};

export const EXCHANGE = 'Orderly';
export const withoutExchangePrefix = (symbol: string) => (symbol.includes(':') ? symbol.split(':')[1] : symbol);

export const withExchangePrefix = (symbol: string) => (symbol.startsWith(`${EXCHANGE}:`) ? symbol : `${EXCHANGE}:${symbol}`);
