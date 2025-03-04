export enum EnumTrackerKeys {
  "withdrawSuccess" = "withdraw:success",
  "withdrawFailed" = "withdraw:failed",
  "depositSuccess" = "deposit:success",
  "depositFailed" = "deposit:failed",
  "signinSuccess" = "signin:success",
  "placeorderSuccess" = "place_order:success",
  "walletConnect" = "wallet:connected",
  "clickLinkDeviceButton" = "click_link_device_button",
  "signLinkDeviceMessageSuccess" = "sign_link_device_message_success",
  "linkDeviceModalClickConfirm" = "link_device_modal_click_confirm",
  "socialLoginSuccess" = "social_login_success",
  "clickSwitchWallet" = "click_switch_wallet",
  "clickSwitchNetwork" = "click_switch_network",
  "switchNetworkSuccess" = "switch_network_success",
  "clickExportPrivateKey" = "click_export_private_key",
  "trackIdentifyUserId" = "track_identify_user_id",
}

export const TrackerListenerKeyMap: { [key in EnumTrackerKeys]: string } = {
  [EnumTrackerKeys.withdrawSuccess]: "withdraw_request_success",
  [EnumTrackerKeys.withdrawFailed]: "withdraw_request_failure",
  [EnumTrackerKeys.depositSuccess]: "deposit_request_success",
  [EnumTrackerKeys.depositFailed]: "deposit_request_failure",
  [EnumTrackerKeys.signinSuccess]: "sign_message_success",
  [EnumTrackerKeys.walletConnect]: "connect_wallet_success",
  [EnumTrackerKeys.placeorderSuccess]: "place_order_success",
  [EnumTrackerKeys.clickLinkDeviceButton]: "click_link_device_button",
  [EnumTrackerKeys.signLinkDeviceMessageSuccess]:
    "sign_link_device_message_success",
  [EnumTrackerKeys.linkDeviceModalClickConfirm]:
    "link_device_modal_click_confirm",
  [EnumTrackerKeys.socialLoginSuccess]: "social_login_success",
  [EnumTrackerKeys.clickSwitchNetwork]: "click_switch_network",
  [EnumTrackerKeys.switchNetworkSuccess]: "switch_network_success",
  [EnumTrackerKeys.clickExportPrivateKey]: "click_export_private_key",
  [EnumTrackerKeys.clickSwitchWallet]: "click_switch_wallet",
  [EnumTrackerKeys.trackIdentifyUserId]: "track_identify_user_id",
};
