export const scaffold = {
  "scaffold.footer.operational": "Operational",
  "scaffold.footer.joinCommunity": "Join our community",
  "scaffold.footer.poweredBy": "Powered by",

  "scaffold.announcement.type.listing": "Listing",
  "scaffold.announcement.type.maintenance": "Maintenance",
  "scaffold.announcement.type.delisting": "Delisting",

  "scaffold.maintenance.dialog.title": "System upgrade in progress",
  "scaffold.maintenance.dialog.description":
    "Sorry, {{brokerName}} is temporarily unavailable due to a scheduled upgrade. The service is expected to be back by {{endDate}}.",
  "scaffold.maintenance.tips.description":
    "{{brokerName}} will be temporarily unavailable for a scheduled upgrade from {{startDate}} to {{endDate}}.",

  "scaffold.restrictedInfo.description.default":
    " You are accessing {{brokerName}} from an IP address ({{ip}}) associated with a restricted country.",
};

export type Scaffold = typeof scaffold;
