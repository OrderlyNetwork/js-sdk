import React, {useRef, useEffect, useState} from "react";
import {Datafeed} from "./tradingViewAdapter/datafeed/datafeed";
import {ChartMode} from "./tradingViewAdapter/type";
import {Widget, WidgetProps} from "./tradingViewAdapter/widget";
import {WebsocketService} from './tradingViewAdapter/datafeed/websocket.service';

import {useWS} from "@orderly.network/hooks";
import {WS} from "@orderly.network/net";
import {ResolutionString} from "./tradingViewAdapter/charting_library";


export interface TradingViewPorps {
    symbol: string;
    libraryPath: string;
    tradingViewScriptSrc: string;
    tradingViewCustomCssUrl?: string;
    interval?: string;
    overrides: any;
    theme?: string;
    studiesOverrides?: any;
    fullscreen?: boolean;
}

export function TradingView({
                                symbol, libraryPath, tradingViewScriptSrc, tradingViewCustomCssUrl, interval, overrides,
                                theme,
                                studiesOverrides,
    fullscreen,
                            }: TradingViewPorps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chart = useRef<any>();

    const ws = useWS();
    const [chartingLibrarySciprtReady, setChartingLibrarySciprtReady] = useState<boolean>(false);

    useEffect(() => {
        if (chartRef.current) {

            const script = document.createElement("script");
            script.setAttribute("data-nscript", "afterInteractive");
            script.src = tradingViewScriptSrc;
            script.async = true;
            script.type = "text/javascript";
            script.onload = () => {
                setChartingLibrarySciprtReady(true);
            };
            script.onerror = () => {
                console.log('trading view path error');
            }
            chartRef.current.appendChild(script);

        }
    }, [chartRef]);

    const onChartClick = () => {
    }
    const layoutId = 'TradingViewSDK';

    useEffect(() => {
        if (!chartingLibrarySciprtReady) {
            return;
        }
        if (chartRef.current) {
            const options: any = {
                fullscreen:fullscreen ?? false,
                autosize: true,
                symbol,
                // locale: getLocale(),
                timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
                container: chartRef.current,
                libraryPath: libraryPath,
                customCssUrl: tradingViewCustomCssUrl,
                interval: interval ?? '1',
                theme: theme ?? 'dark',

                overrides: overrides,
                studiesOverrides,
                datafeed: new Datafeed(ws),
                getBroker: undefined,

            };
            const mode = ChartMode.UNLIMITED;

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
    }, [chartingLibrarySciprtReady]);

    useEffect(() => {
        console.log('symbol', symbol);
        chart.current?.setSymbol(symbol);
        const service = new WebsocketService(ws as WS);
        service.subscribeSymbol(symbol);
        return () => {
            service.unsubscribeKline(symbol);
        }
    }, [symbol]);
    return (
        <div style={{
            height: '100%', width: '100%', margin: '0 auto'
        }} ref={chartRef}></div>

    );
}