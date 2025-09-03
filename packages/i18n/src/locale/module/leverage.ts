export const leverage = {
  "leverage.maxAccountLeverage": "Max account leverage",
  "leverage.accountLeverage": "Account leverage",
  "leverage.currentLeverage": "Current leverage",
  "leverage.maxLeverage": "Max leverage",
  "leverage.updated": "Leverage updated",
  "leverage.adjustedLeverage": "Adjusted leverage",
  "leverage.maxPositionLeverage.tips":
    "* Maximum position at current leverage: <0>{{amount}}</0> USDC",
  "leverage.maxAvailableLeverage.tips":
    "* Highest available leverage <0>{{leverage}}</0>. Selecting higher leverage increases your liquidation risk.",
  "leverage.overRequiredMargin.tips":
    "Margin is not enough. Please try adjusting to another leverage level.",
  "leverage.overMaxPositionLeverage.tips":
    "Current highest available leverage is <0>{{leverage}}</0>. Please try adjusting to another leverage level.",
};

export type Leverage = typeof leverage;
