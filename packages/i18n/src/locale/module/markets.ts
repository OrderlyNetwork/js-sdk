export const markets = {
  "markets.favorites": "Favorites",
  "markets.recent": "Recent",
  "markets.newListings": "New listings",
  "markets.allMarkets": "All markets",

  "markets.openInterest": "Open interest",
  "markets.openInterest.tooltip": "Total size of positions per side.",

  "markets.topGainers": "Top gainers",
  "markets.topLosers": "Top losers",

  "markets.search.placeholder": "Search market",
  "markets.dataList.favorites.empty":
    "Click on the <0/> icon next to a market to add it to your list.",

  "markets.dataList.column.8hFunding": "8h funding",
  "markets.dataList.column.moveTop": "Move to top",

  "markets.favorites.dropdown.title": "Select lists for",
  "markets.favorites.dropdown.addPlaceholder": "Add a new watchlist",
  "markets.favorites.tabs.maxList": "Maximum 10 groups in the favorite list",
  "markets.favorites.tabs.maxName": "List name cannot exceed 15 characters",
  "markets.favorites.tabs.delete.dialog.title": "Delete list",
  "markets.favorites.tabs.delete.dialog.description":
    "Are you sure you want to delete {{name}}?",

  "markets.column.market": "Market",
  "markets.column.24hChange": "24h change",
  "markets.column.24hVolume": "24h volume",
  "markets.column.symbol&Volume": "Market / Volume",
  "markets.column.price&Change": "Price / change",
  "markets.column.last": "Last",
  "markets.column.24hPercentage": "24h%",

  "markets.funding.comparison": "Comparison",
  "markets.funding.column.estFunding": "Est. funding",
  "markets.funding.column.lastFunding": "Last funding",
  "markets.funding.column.1dAvg": "1D avg.",
  "markets.funding.column.3dAvg": "3D avg.",
  "markets.funding.column.7dAvg": "7D avg.",
  "markets.funding.column.14dAvg": "14D avg.",
  "markets.funding.column.30dAvg": "30D avg.",
  "markets.funding.column.90dAvg": "90D avg.",
  "markets.funding.column.positiveRate": "Positive rate",

  "markets.symbolInfoBar.Mark": "Mark",
  "markets.symbolInfoBar.Mark.tooltip":
    "Price for the computation of unrealized PnL and liquidation.",
  "markets.symbolInfoBar.Index": "Index",
  "markets.symbolInfoBar.Index.tooltip":
    "Average of the last prices across other exchanges.",
  "markets.symbolInfoBar.24hVolume": "24h volume",
  "markets.symbolInfoBar.24hVolume.tooltip":
    "24 hour total trading volume on the Orderly Network.",
  "markets.symbolInfoBar.predFundingRate": "Pred. funding rate",
  "markets.symbolInfoBar.predFundingRate.tooltip":
    "Funding rates are payments between traders who are long and short. When positive, long positions pay short positions funding. When negative, short positions pay long positions.",
};

export type Markets = typeof markets;
