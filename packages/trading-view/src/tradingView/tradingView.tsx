import React, {useRef, useEffect} from "react";
import { Datafeed } from "./tradingViewAdapter/datafeed/datafeed";
import { ChartMode } from "./tradingViewAdapter/type";
import {Widget, WidgetProps } from "./tradingViewAdapter/widget";

import { useWS } from "@orderly.network/hooks";


export default function TradingView(){
    const chartRef = useRef<HTMLDivElement>(null);
    const chart = useRef<any>();
    const symbol = 'NEAR_PERP_USDC';
    const ws = useWS();

    const onChartClick = () => {
        console.log('-- chart click');
    }
    const layoutId = 'TradingViewSDK';

    useEffect(() => {
        if (chartRef.current) {
            const options: any = {
                fullscreen: false,
                autosize: true,
                symbol,
                // locale: getLocale(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                container: chartRef.current,
                libraryPath: '/charting_library/',
                // customCssUrl: '/assets/woo-chart/chart.v2.1.css',
                customFontFamily: '"DIN2014", "Trebuchet MS", roboto, ubuntu, sans-serif',
                datafeed: new Datafeed(ws),
                getBroker: undefined,
            };
            const mode = ChartMode.BASIC;

            const chartProps: WidgetProps = {
                options,
                layoutId,
                chartKey: layoutId,
                mode,
                onClick: onChartClick,
            };

            chart.current = new Widget(chartProps);
        }

        return () => {
            chart.current?.remove();
        };
    }, []);
    return (
        <>

            <div style={{height: '100%'}} ref={chartRef}></div>
        </>
    )
}