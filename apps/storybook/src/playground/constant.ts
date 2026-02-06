export enum PathEnum {
  Root = "/",
  Perp = "/perp",
  Swap = "/swap",

  Portfolio = "/portfolio",
  Positions = "/portfolio/positions",
  Orders = "/portfolio/orders",
  Assets = "/portfolio/assets",
  FeeTier = "/portfolio/fee",
  ApiKey = "/portfolio/api-key",
  Setting = "/portfolio/setting",
  History = "/portfolio/history",

  Markets = "/markets",
  Leaderboard = "/leaderboard",

  Announcement = "/announcement",

  Rewards = "/rewards",
  RewardsTrading = "/rewards/trading",
  RewardsAffiliate = "/rewards/affiliate",

  Vaults = "/vaults",
  Points = "/points",
}

export const PageTitleMap = {
  [PathEnum.Portfolio]: "Portfolio",
  [PathEnum.FeeTier]: "Fee tier",
  [PathEnum.ApiKey]: "API keys",
  [PathEnum.Orders]: "Orders",
  [PathEnum.Positions]: "Positions",
  [PathEnum.Assets]: "Assets",
  [PathEnum.Setting]: "Settings",
  [PathEnum.History]: "History",
  [PathEnum.Markets]: "Markets",
  [PathEnum.Leaderboard]: "Leaderboard",
  [PathEnum.Announcement]: "Announcement",
  [PathEnum.RewardsTrading]: "Trading Rewards",
  [PathEnum.RewardsAffiliate]: "Affiliate program",
  [PathEnum.Vaults]: "Vaults",
  [PathEnum.Points]: "Points",
  [PathEnum.Swap]: "Spot",
};
