import React, {useRef, useEffect, useState} from "react";
import {Datafeed} from "./tradingViewAdapter/datafeed/datafeed";
import {ChartMode} from "./tradingViewAdapter/type";
import {Widget, WidgetProps} from "./tradingViewAdapter/widget";
import {WebsocketService} from './tradingViewAdapter/datafeed/websocket.service';

import { useWS } from "@orderly.network/hooks";
import {WS} from "@orderly.network/net";


export interface TradingViewOptions {
  
}

export interface TradingViewPorps {
    symbol?: string;
    mode?:ChartMode;
    libraryPath: string;
    tradingViewScriptSrc: string;
    tradingViewCustomCssUrl?: string;
    interval?: string;
    overrides?: any;
    theme?: string;
    studiesOverrides?: any;
    fullscreen?: boolean;
}

function Link(props: {
    url: string;
    children?:any;
}) {
    return (
        <span onClick={() => window.open(props.url)} style={{
            color: 'rgba(var(--orderly-color-primary, 1))',

        }}>
            {props.children}
        </span>
    )
}


const getOveriides = () => {
    const upColor = "#00B59F";
    const downColor = "#FF67C2";
    const  overrides =  {
        "paneProperties.background": "#16141c",
        // "paneProperties.background": "#ffff00",
        // "mainSeriesProperties.style": 1,
        "paneProperties.backgroundType": "solid",
        // "paneProperties.background": "#151822",

        "mainSeriesProperties.candleStyle.upColor": upColor,
        "mainSeriesProperties.candleStyle.downColor": downColor,
        "mainSeriesProperties.candleStyle.borderColor": upColor,
        "mainSeriesProperties.candleStyle.borderUpColor": upColor,
        "mainSeriesProperties.candleStyle.borderDownColor": downColor,
        "mainSeriesProperties.candleStyle.wickUpColor": upColor,
        "mainSeriesProperties.candleStyle.wickDownColor": downColor,
        "paneProperties.separatorColor": "#2B2833",
        "paneProperties.vertGridProperties.color": "#26232F",
        "paneProperties.horzGridProperties.color": "#26232F",
        "scalesProperties.textColor": "#97969B",
    };
    const     studiesOverrides = {
        "volume.volume.color.0": "#613155",
        "volume.volume.color.1": "#14494A",
    };

    return  {
        overrides,
        studiesOverrides,
    }
}

export function TradingView({
                                symbol,
    mode = ChartMode.UNLIMITED,
                                libraryPath,
                                tradingViewScriptSrc,
                                tradingViewCustomCssUrl,
interval,
overrides: customerOverrides,
theme,
studiesOverrides: customerStudiesOverrides,
fullscreen,
                            }: TradingViewPorps) {
    const chartRef = useRef<HTMLDivElement>(null);
    const chart = useRef<any>();


    const ws = useWS();
    const [chartingLibrarySciprtReady, setChartingLibrarySciprtReady] = useState<boolean>(false);

    useEffect(() => {
        if (!tradingViewScriptSrc) {
            return;
        }
        if (chartRef.current) {

            const script = document.createElement("script");
            script.setAttribute("data-nscript", "afterInteractive");
            script.src =tradingViewScriptSrc;
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
    }, [chartRef,tradingViewScriptSrc]);

    const onChartClick = () => {
    }
    const layoutId = 'TradingViewSDK';

    useEffect(() => {
        if (!chartingLibrarySciprtReady || !tradingViewScriptSrc) {
            return;
        }

        const defaultOverrides = getOveriides();
        const overrides = customerOverrides? Object.assign({}, defaultOverrides.overrides, customerOverrides) : defaultOverrides.overrides;
        const studiesOverrides = customerStudiesOverrides? Object.assign({}, defaultOverrides.studiesOverrides, customerStudiesOverrides) : defaultOverrides.studiesOverrides;
        if (chartRef.current) {
            const options: any = {
                fullscreen: fullscreen ?? false,
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
        if (!symbol || !chart.current) {
            return;
        }
        chart.current?.setSymbol(symbol);
        const service = new WebsocketService(ws as WS);
        service.subscribeSymbol(symbol);
        return () => {
            service.unsubscribeKline(symbol);
        }
    }, [symbol]);

    useEffect(() => {
       if (!chart.current) {
           return;
       }
       chart.current.updateOverrides({
           interval,
       });

    }, [interval]);
    return (
        <div style={{
            height: '100%', width: '100%', margin: '0 auto'
        }} ref={chartRef}>
            {(!tradingViewScriptSrc) &&
                <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: '100%',
                    height: '100%',
                }}>

                <div style={{
                    color: 'rgb(var(--orderly-color-base-foreground) / 0.98)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    alignItems: 'left',
                    height: '100%',
                    padding: '20px',
                    fontSize: '14px',
                    lineHeight:'1.3rem',
                    margin: '0 auto',
                }}>
                    <p style={{
                        marginBottom: '24px',
                    }}>Due to TradingView's policy, you will need to apply for your own license.</p>

                    <p style={{
                        marginBottom:'12px',
                    }}>1.&nbsp;Please apply for your TradingView license <Link url=''>here</Link>.</p>
                    <p>2.&nbsp;Follow the instructions on <Link url=''>sdk.orderly.network</Link> to set up.</p>
            </div>
                </div>
            }
        </div>

    );
}