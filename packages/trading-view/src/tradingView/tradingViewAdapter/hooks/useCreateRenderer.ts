import {useRef, useEffect, useState} from 'react';
import {Renderer} from '../renderer/renderer';
import {useOrderStream, usePositionStream} from '@orderly.network/hooks';
import {OrderStatus} from "@orderly.network/types";
import { TpslAlgoType } from '../renderer/tpsl.util';
import { AlgoType } from '../type';

export default function useCreateRenderer(symbol: string) {
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
    }, [renderer, positions, symbol]);

    useEffect(() => {
        const flattenOrders: any = [];
        pendingOrders?.forEach(order=> {
            if (TpslAlgoType.includes(order.algo_type)){
                for(const child_order of order.child_orders) {
                    child_order.root_algo_order_algo_type = order.algo_type;
                    flattenOrders.push(child_order);
                }

            } else {

                flattenOrders.push(order)
            }
        });
        renderer?.renderPendingOrders(flattenOrders);

    }, [renderer, pendingOrders, symbol]);

    return [createRenderer.current, removeRenderer.current] as const;
}