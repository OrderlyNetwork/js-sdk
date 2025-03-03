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
  "SOCIAL_LOGIN_SUCCESS" = "social_login_success",
  "CLICK_SWITCH_WALLET" = "click_switch_wallet",
  "CLICK_SWITCH_NETWORK" = "click_switch_network",
  "SWITCH_NETWORK_SUCCESS" = "switch_network_success",
  "CLICK_EXPORT_PRIVATE_KEY" = "click_export_private_key",
  "TRACK_IDENTIFY_USER_ID" = "track_identify_user_id",
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
  [EnumTrackerKeys.SOCIAL_LOGIN_SUCCESS]: "social_login_success",
  [EnumTrackerKeys.CLICK_SWITCH_NETWORK]: "click_switch_network",
  [EnumTrackerKeys.SWITCH_NETWORK_SUCCESS]: "switch_network_success",
  [EnumTrackerKeys.CLICK_EXPORT_PRIVATE_KEY]: "click_export_private_key",
  [EnumTrackerKeys.CLICK_SWITCH_WALLET]: "click_switch_wallet",
  [EnumTrackerKeys.TRACK_IDENTIFY_USER_ID]: "track_identify_user_id",
};
