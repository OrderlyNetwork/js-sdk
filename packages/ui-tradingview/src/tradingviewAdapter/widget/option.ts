import { ChartMode, TradingTerminalWidgetOptions } from "../type";

const getDisabledFeatures = (mode: ChartMode) => {
  let disabledFeatures = [
    "header_symbol_search",
    "volume_force_overlay",
    "trading_account_manager",
    "drawing_templates",
    "open_account_manager",
    "right_toolbar",
    "support_multicharts",
    "header_layouttoggle",
    "order_panel",
    "order_info",
    "trading_notifications",
    "display_market_status",
    "broker_button",
    "add_to_watchlist",
    "chart_crosshair_menu",
    "header_fullscreen_button",
    "header_widget",
  ];

  if (mode === ChartMode.MOBILE) {
    disabledFeatures = [
      ...disabledFeatures,
      "left_toolbar",
      "timeframes_toolbar",
      "go_to_date",
      "timezone_menu",
      // add volume back
      "create_volume_indicator_by_default",
      "buy_sell_buttons",
    ];
  }
  if (mode === ChartMode.BASIC) {
    disabledFeatures = [
      ...disabledFeatures,
      "header_widget",
      "left_toolbar",
      "timeframes_toolbar",
      "buy_sell_buttons",
    ];
  } else if (mode === ChartMode.ADVANCED) {
    disabledFeatures = [
      ...disabledFeatures,
      "left_toolbar",
      "timeframes_toolbar",
      "buy_sell_buttons",
    ];
  }

  return disabledFeatures;
};

export default function getOptions(
  options: any,
  mode: any,
): TradingTerminalWidgetOptions {
  return {
    ...options,
    disabled_features: getDisabledFeatures(mode),
    enabled_features: [
      "hide_left_toolbar_by_default",
      "order_panel_close_button",
      "iframe_loading_compatibility_mode",
    ],
    auto_save_delay: 0.1,
    broker_config: {
      configFlags: {
        supportStopLimitOrders: true,
        supportReversePosition: false,
      },
    },
  };
}
