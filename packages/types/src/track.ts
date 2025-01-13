export enum EnumTrackerKeys {
  "WITHDRAW_SUCCESS" = "withdraw:success",
  "WITHDRAW_FAILED" = "withdraw:failed",
  "DEPOSIT_SUCCESS" = "deposit:success",
  "DEPOSIT_FAILED" = "deposit:failed",
  "SIGNIN_SUCCESS" = "signin:success",
  "PLACEORDER_SUCCESS" = "place_order:success",
  "WALLET_CONNECT" = "wallet:connected",
  "CLICK_LINK_DEVICE_BUTTON" = "click_link_device_button",
  "SIGN_LINK_DEVICE_MESSAGE_SUCCESS" = "sign_link_device_message_success",
  "LINK_DEVICE_MODAL_CLICK_CONFIRM" = "link_device_modal_click_confirm",
}

export const TrackerListenerKeyMap: { [key in EnumTrackerKeys]: string } = {
  [EnumTrackerKeys.WITHDRAW_SUCCESS]: "withdraw_request_success",
  [EnumTrackerKeys.WITHDRAW_FAILED]: "withdraw_request_failure",
  [EnumTrackerKeys.DEPOSIT_SUCCESS]: "deposit_request_success",
  [EnumTrackerKeys.DEPOSIT_FAILED]: "deposit_request_failure",
  [EnumTrackerKeys.SIGNIN_SUCCESS]: "sign_message_success",
  [EnumTrackerKeys.WALLET_CONNECT]: "connect_wallet_success",
  [EnumTrackerKeys.PLACEORDER_SUCCESS]: "place_order_success",
  [EnumTrackerKeys.CLICK_LINK_DEVICE_BUTTON]: "click_link_device_button",
  [EnumTrackerKeys.SIGN_LINK_DEVICE_MESSAGE_SUCCESS]:
    "sign_link_device_message_success",
  [EnumTrackerKeys.LINK_DEVICE_MODAL_CLICK_CONFIRM]:
    "link_device_modal_click_confirm",
};
