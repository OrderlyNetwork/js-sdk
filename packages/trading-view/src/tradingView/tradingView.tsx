import React, {useRef, useEffect, useState} from "react";
import {Datafeed} from "./tradingViewAdapter/datafeed/datafeed";
import {ChartMode} from "./tradingViewAdapter/type";
import {Widget, WidgetProps} from "./tradingViewAdapter/widget";
import {WebsocketService} from './tradingViewAdapter/datafeed/websocket.service';

import {useWS} from "@orderly.network/hooks";
import {WS} from "@orderly.network/net";


interface TradingViewPorps {
    symbol: string;
}

export default function TradingView({symbol}: TradingViewPorps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chart = useRef<any>();

    const ws = useWS();
    const [chartingLibrarySciprtReady, setChartingLibrarySciprtReady] = useState<boolean>(false);

    useEffect(() => {
        if (chartRef.current) {

            const script = document.createElement("script");
            script.setAttribute("data-nscript", "afterInteractive");
            script.src = '/charting_library/charting_library.js';
            script.async = true;
            script.type = "text/javascript";
            script.onload = () => {
                console.log('--33');

                setChartingLibrarySciprtReady(true);
            };
            chartRef.current.appendChild(script);

        }
    }, [chartRef]);

    const onChartClick = () => {
        console.log('-- chart click');
    }
    const layoutId = 'TradingViewSDK';

    useEffect(() => {
        if (!chartingLibrarySciprtReady) {
            return;
        }
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
            const mode = ChartMode.UNLIMITED;

            const chartProps: WidgetProps = {
                options,
                layoutId,
                chartKey: layoutId,
                mode,
                onClick: onChartClick,
            };

            console.log('ws', ws);
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
       return () =>{
           service.unsubscribeKline(symbol);
       }
    }, [symbol]);
    return (
            <div style={{height: '600px',width: '900px', margin: '0 auto'}} ref={chartRef}></div>

    );
}