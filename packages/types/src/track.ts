export enum EnumTrackerKeys{
  "wallet:connected" = "wallet:connected",
  "withdraw:success" = "withdraw:success",
  "withdraw:failed" = "withdraw:failed",
  "deposit:success" = "deposit:success",
  "deposit:failed" = "deposit:failed",
  "signin:success" = "signin:success",
  "place_order:success" = "place_order:success",
}
export const TrackerListenerKeyMap: { [key in EnumTrackerKeys]: string } = {
  [EnumTrackerKeys["withdraw:success"]]: "withdraw_success",
  [EnumTrackerKeys["withdraw:failed"]]: "withdraw_failure",
  [EnumTrackerKeys["deposit:success"]]: "deposit_success",
  [EnumTrackerKeys["deposit:failed"]]: "deposit_failure",
  [EnumTrackerKeys["signin:success"]]: "sign_message_success",
  [EnumTrackerKeys["wallet:connected"]]: "connect_wallet_success",
  [EnumTrackerKeys["place_order:success"]]: "place_order_success",
};

