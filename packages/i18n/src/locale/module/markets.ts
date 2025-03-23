export const markets = {
  "markets.page.tabs.markets": "Markets",
  "markets.page.tabs.funding": "Funding",

  "markets.header.24hVolume": "24h volume",
  "markets.header.openInterest": "Open interest",
  "markets.header.assets": "Assets (TVL)",
  "markets.header.newListings": "New listings",
  "markets.header.topGainers": "Top gainers",
  "markets.header.topLosers": "Top losers",

  "markets.dataList.tabs.favorites": "Favorites",
  "markets.dataList.tabs.allMarkets": "All Markets",
  "markets.dataList.tabs.newListings": "New Listings",
  "markets.dataList.search.placeholder": "Search market",
  "markets.dataList.favorites.empty":
    "Click on the <0/> icon next to a market to add it to your list.",

  "markets.dataList.column.symbol": "Market",
  "markets.dataList.column.price": "Price",
  "markets.dataList.column.24hChange": "24h change",
  "markets.dataList.column.24hVolume": "24h volume",
  "markets.dataList.column.openInterest": "Open interest",
  "markets.dataList.column.8hFunding": "8h funding",
  "markets.dataList.column.moveTop": "Move to top",

  "markets.favorites.dropdown.title": "Select lists for",
  "markets.favorites.dropdown.add": "Add",
  "markets.favorites.dropdown.addPlaceholder": "Add a new watchlist",
  "markets.favorites.dropdown.cancel": "Cancel",
  "markets.favorites.dropdown.confirm": "Confirm",

  "markets.favorites.tabs.maxList": "Maximum 10 groups in the favorite list",
  "markets.favorites.tabs.maxName": "List name cannot exceed 15 characters",
  "markets.favorites.tabs.delete.title": "Delete list",
  "markets.favorites.tabs.delete.description":
    "Are you sure you want to delete {{name}}?",

  "markets.funding.tabs.overview": "Overview",
  "markets.funding.tabs.comparison": "Comparison",
  "markets.funding.search.placeholder": "Search symbol",
  "markets.funding.column.symbol": "Market",
  "markets.funding.column.estFunding": "Est. funding",
  "markets.funding.column.lastFunding": "Last funding",
  "markets.funding.column.1dAvg": "1d avg.",
  "markets.funding.column.3dAvg": "3d avg.",
  "markets.funding.column.7dAvg": "7d avg.",
  "markets.funding.column.14dAvg": "14d avg.",
  "markets.funding.column.30dAvg": "30d avg.",
  "markets.funding.column.90dAvg": "90d avg.",
  "markets.funding.column.positiveRate": "Positive rate",
  "markets.funding.column.positiveRate.1d": "1d",
  "markets.funding.column.positiveRate.3d": "3d",
  "markets.funding.column.positiveRate.7d": "7d",
  "markets.funding.column.positiveRate.14d": "14d",
  "markets.funding.column.positiveRate.30d": "30d",
  "markets.funding.column.positiveRate.90d": "90d",

  "markets.sidebar.tabs.favorites": "Favorites",
  "markets.sidebar.tabs.recent": "Recent",
  "markets.sidebar.tabs.all": "All",
  "markets.sidebar.tabs.newListings": "New Listings",

  "markets.sidebar.title": "Markets",
  "markets.sidebar.search.placeholder": "Search",
  "markets.sidebar.column.symbolVolume": "Market / Volume",
  "markets.sidebar.column.priceChange": "Price / change",

  "markets.dropdown.column.symbol": "Symbol",
  "markets.dropdown.column.price": "Last",
  "markets.dropdown.column.24hChange": "24h%",
  "markets.dropdown.column.volume": "Volume",

  "markets.symbolInfoBar.24hChange": "24h Change",
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
  "markets.symbolInfoBar.openInterest": "Open interest",
  "markets.symbolInfoBar.openInterest.tooltip":
    "Total size of positions per side.",
};

export type Markets = typeof markets;
