export enum TrackerEventName {
  /** virtual event (not send this event name to tracker) */
  trackIdentifyUserId = "track_identify_user_id",
  trackIdentify = "track_identify",
  trackCustomEvent = "track_custom_event",

  /** real event name (send this event name to tracker) */
  withdrawSuccess = "withdraw_request_success",
  withdrawFailed = "withdraw_request_failure",
  depositSuccess = "deposit_request_success",
  depositFailed = "deposit_request_failure",
  signinSuccess = "sign_message_success",
  placeOrderSuccess = "place_order_success",
  walletConnect = "connect_wallet_success",
  clickLinkDeviceButton = "click_link_device_button",
  signLinkDeviceMessageSuccess = "sign_link_device_message_success",
  linkDeviceModalClickConfirm = "link_device_modal_click_confirm",
  socialLoginSuccess = "social_login_success",
  clickSwitchNetwork = "click_switch_network",
  clickSwitchWallet = "click_switch_wallet",
  switchNetworkSuccess = "switch_network_success",
  clickExportPrivateKey = "click_export_private_key",
  switchLanguage = "switch_language",
  leaderboardCampaignClickTradeNow = "leaderboard_campaign_click_trade_now",
  leaderboardCampaignClickLearnMore = "leaderboard_campaign_click_learn_more",
}
