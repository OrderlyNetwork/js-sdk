import {useRef, useEffect, useState} from 'react';
import {Renderer} from '../renderer/renderer';
import {useOrderStream, usePositionStream} from '@orderly.network/hooks';
import {OrderStatus} from "@orderly.network/types";
import { TpslAlgoType } from '../renderer/tpsl.util';
import { AlgoType } from '../type';
import { DisplayControlSettingInterface } from '@/tradingView/tradingView';

export default function useCreateRenderer(symbol: string, displayControlSetting?: DisplayControlSettingInterface) {
    const [renderer, setRenderer] = useState<Renderer>();
    const rendererRef = useRef<Renderer>();

    const [{rows: positions}, positionsInfo] = usePositionStream(symbol);
    const [pendingOrders] =
        useOrderStream({
            status: OrderStatus.INCOMPLETE,
            symbol: symbol,
        });

    const createRenderer = useRef(
        (instance: any, host: any, broker: any) => {
            if (rendererRef.current) {
                rendererRef.current.remove();
            }
            rendererRef.current = new Renderer(instance, host, broker);
            setRenderer(rendererRef.current);
        }
    );
    const removeRenderer = useRef(() => {
        rendererRef.current?.remove();
        rendererRef.current = undefined;
    });

    useEffect(() => {
        if (!displayControlSetting || !displayControlSetting.position) {
            renderer?.renderPositions([]);
            return
        }
        const positionList = (positions ?? []).map(item => {
            return {
                symbol: item.symbol,
                open: item.average_open_price,
                balance: item.position_qty,
                closablePosition: 9999,
                // @ts-ignore
                unrealPnl: item.unrealized_pnl,
                interest: 0,
                unrealPnlDecimal: 2,
                basePriceDecimal: 4,
            }
        });
        renderer?.renderPositions(positionList);
    }, [renderer, positions, symbol, displayControlSetting]);

    useEffect(() => {
        let tpslOrder: any = [];
        let positionTpsl: any = [];
        let limitOrder: any = [];
        let stopOrder: any = [];

        pendingOrders?.forEach(order=> {
            if (!order.algo_order_id) {
                limitOrder.push(order);
            }else if (order.algo_order_id) {
                if (order.algo_type === AlgoType.POSITIONAL_TP_SL ) {
                    for(const child_order of order.child_orders) {
                        child_order.root_algo_order_algo_type = order.algo_type;
                        positionTpsl.push(child_order);
                    }
                } else if (order.algo_type === AlgoType.TP_SL) {
                    for(const child_order of order.child_orders) {
                        child_order.root_algo_order_algo_type = order.algo_type;
                        tpslOrder.push(child_order);
                    }

                } else if (order.algo_type === AlgoType.STOP_LOSS || order.algo_type === AlgoType.TAKE_PROFIT) {
                    stopOrder.push(order);
                }
            }
        });
        if (displayControlSetting) {
            if (!displayControlSetting.positionTpsl) {
                positionTpsl = [];
            }
            if (!displayControlSetting.tpsl) {
                tpslOrder = [];
            }
            if (!displayControlSetting.limitOrders) {
                limitOrder = [];
            }
            if (!displayControlSetting.stopOrders) {
                stopOrder = [];

            }
        }

        renderer?.renderPendingOrders(tpslOrder.concat(positionTpsl).concat(limitOrder).concat(stopOrder));

    }, [renderer, pendingOrders, symbol, displayControlSetting]);

    return [createRenderer.current, removeRenderer.current] as const;
}