export enum EnumTrackerKeys{
  "WITHDRAW_SUCCESS" = "withdraw:success",
  "WITHDRAW_FAILED" = "withdraw:failed",
  "DEPOSIT_SUCCESS" = "deposit:success",
  "DEPOSIT_FAILED" = "deposit:failed",
  "SIGNIN_SUCCESS" = "signin:success",
  "PLACEORDER_SUCCESS" = "place_order:success",
  "WALLET_CONNECT" = "wallet:connected",
}
export const TrackerListenerKeyMap: { [key in EnumTrackerKeys]: string } = {
  [EnumTrackerKeys.WITHDRAW_SUCCESS]: "withdraw_request_success",
  [EnumTrackerKeys.WITHDRAW_FAILED]: "withdraw_request_failure",
  [EnumTrackerKeys.DEPOSIT_SUCCESS]: "deposit_request_success",
  [EnumTrackerKeys.DEPOSIT_FAILED]: "deposit_request_failure",
  [EnumTrackerKeys.SIGNIN_SUCCESS]: "sign_message_success",
  [EnumTrackerKeys.WALLET_CONNECT]: "connect_wallet_success",
  [EnumTrackerKeys.PLACEORDER_SUCCESS]: "place_order_success",
};

