import {useRef, useEffect, useContext} from 'react';
import {Renderer} from '../renderer/renderer';
import {useOrderStream, usePositionStream} from '@orderly.network/hooks';
import {OrderStatus} from "@orderly.network/types";

export default function useCreateRenderer(symbol: string) {
    const renderer = useRef<Renderer>();

    const [{rows: positions}, positionsInfo] = usePositionStream(symbol);
    const [pendingOrders] =
        useOrderStream({
            status: OrderStatus.INCOMPLETE,
            symbol: symbol,
        });

    const createRenderer = useRef(
        (instance: any, host: any, broker: any) => {
            renderer.current = new Renderer(instance, host, broker);
            renderer.current = new Renderer(instance, host, broker);
        }
    );


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

        renderer.current?.renderPositions(positionList);
    }, [renderer.current, positions, symbol]);

    useEffect(() => {
        renderer.current?.renderPendingOrders(pendingOrders);

    }, [renderer.current, pendingOrders, symbol]);

    return [renderer, createRenderer.current] as const;
}