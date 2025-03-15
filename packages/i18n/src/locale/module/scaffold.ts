export const scaffold = {
  "scaffold.accountSummary.totalValue": "Total value",
  "scaffold.accountSummary.freeCollateral": "Free collateral",
  "scaffold.accountSummary.currentLeverage": "Current leverage",
  "scaffold.accountSummary.maxLeverage": "Max leverage",
  "scaffold.accountSummary.unrealPnL": "Unreal. PnL",
  "scaffold.accountSummary.unrealizedPnL": "Unrealized PnL",

  "scaffold.footer.operational": "Operational",
  "scaffold.footer.joinCommunity": "Join our community",
  "scaffold.footer.poweredBy": "Powered by",

  "scaffold.maintenance.dialog.title": "System upgrade in progress",

  "scaffold.maintenance.tips.content":
    "{{brokerName}} will be temporarily unavailable for a scheduled upgrade from {{startDate}} to {{endDate}}.",
  "scaffold.maintenance.dialog.content":
    "Sorry, {{brokerName}} is temporarily unavailable due to a scheduled upgrade. The service is expected to be back by {{endDate}}.",

  "scaffold.restrictedInfo.content.default":
    " You are accessing {{brokerName}} from an IP address ({{ip}}) associated with a restricted country.",
};

export type Scaffold = typeof scaffold;
