import merge from 'lodash/merge';
import { CHART_BG, CHART_GREEN, CHART_RED } from '../color';
import { ChartMode, TradingTerminalWidgetOptions } from '../type';

const wootradeDefaultTheme = {
    overrides: {
        'mainSeriesProperties.candleStyle.upColor': CHART_GREEN,
        'mainSeriesProperties.candleStyle.downColor': CHART_RED,
        'mainSeriesProperties.candleStyle.borderUpColor': CHART_GREEN,
        'mainSeriesProperties.candleStyle.borderDownColor': CHART_RED,
        'mainSeriesProperties.candleStyle.wickUpColor': CHART_GREEN,
        'mainSeriesProperties.candleStyle.wickDownColor': CHART_RED,

        'mainSeriesProperties.hollowCandleStyle.upColor': CHART_GREEN,
        'mainSeriesProperties.hollowCandleStyle.downColor': CHART_RED,
        'mainSeriesProperties.hollowCandleStyle.borderUpColor': CHART_GREEN,
        'mainSeriesProperties.hollowCandleStyle.borderDownColor': CHART_RED,
        'mainSeriesProperties.hollowCandleStyle.wickUpColor': CHART_GREEN,
        'mainSeriesProperties.hollowCandleStyle.wickDownColor': CHART_RED,

        'mainSeriesProperties.haStyle.upColor': CHART_GREEN,
        'mainSeriesProperties.haStyle.downColor': CHART_RED,
        'mainSeriesProperties.haStyle.borderUpColor': CHART_GREEN,
        'mainSeriesProperties.haStyle.borderDownColor': CHART_RED,
        'mainSeriesProperties.haStyle.wickUpColor': CHART_GREEN,
        'mainSeriesProperties.haStyle.wickDownColor': CHART_RED,

        'mainSeriesProperties.baselineStyle.topLineColor': CHART_GREEN,
        'mainSeriesProperties.baselineStyle.bottomLineColor': CHART_RED,

        'mainSeriesProperties.pbStyle.upColor': CHART_GREEN,
        'mainSeriesProperties.pbStyle.downColor': CHART_RED,
        'mainSeriesProperties.pbStyle.borderUpColor': CHART_GREEN,
        'mainSeriesProperties.pbStyle.borderDownColor': CHART_RED,

        'mainSeriesProperties.renkoStyle.upColor': CHART_GREEN,
        'mainSeriesProperties.renkoStyle.downColor': CHART_RED,
        'mainSeriesProperties.renkoStyle.borderUpColor': CHART_GREEN,
        'mainSeriesProperties.renkoStyle.borderDownColor': CHART_RED,
        'mainSeriesProperties.renkoStyle.wickUpColor': CHART_GREEN,
        'mainSeriesProperties.renkoStyle.wickDownColor': CHART_RED,

        'mainSeriesProperties.kagiStyle.upColor': CHART_GREEN,
        'mainSeriesProperties.kagiStyle.downColor': CHART_RED,

        'mainSeriesProperties.pnfStyle.upColor': CHART_GREEN,
        'mainSeriesProperties.pnfStyle.downColor': CHART_RED,

        'mainSeriesProperties.rangeStyle.upColor': CHART_GREEN,
        'mainSeriesProperties.rangeStyle.downColor': CHART_RED,

        'paneProperties.legendProperties.showSeriesTitle': false,
        'paneProperties.background': CHART_BG,
        'paneProperties.backgroundType': 'solid',
    },
    studies_overrides: {
        'volume.volume.color.0': CHART_RED,
        'volume.volume.color.1': CHART_GREEN,
    },
};

const getDisabledFeatures = (mode: ChartMode) => {
    let disabledFeatures = [
        'header_symbol_search',
        'volume_force_overlay',
        'trading_account_manager',
        'drawing_templates',
        'open_account_manager',
        'right_toolbar',
        'support_multicharts',
        'header_layouttoggle',
        'order_panel',
        'order_info',
        'trading_notifications',
        'display_market_status',
        'broker_button',
        'add_to_watchlist',
        'chart_crosshair_menu',
        'header_fullscreen_button',
    ];

    if (mode === ChartMode.BASIC) {
        disabledFeatures = [...disabledFeatures, 'header_widget', 'left_toolbar', 'timeframes_toolbar', 'buy_sell_buttons'];
    } else if (mode === ChartMode.ADVANCED) {
        disabledFeatures = [...disabledFeatures, 'left_toolbar', 'timeframes_toolbar', 'buy_sell_buttons'];
    }

    return disabledFeatures;
};

export default function getOptions(options: any, mode: any): TradingTerminalWidgetOptions {
    return merge(
        {
            ...options,
            disabled_features: getDisabledFeatures(mode),
            enabled_features: ['hide_left_toolbar_by_default', 'order_panel_close_button'],
            theme: 'Dark',
            auto_save_delay: 0.1,
            broker_config: {
                configFlags: {
                    supportStopLimitOrders: true,
                    supportReversePosition: false,
                },
            },
        },
        wootradeDefaultTheme,
    );
}
