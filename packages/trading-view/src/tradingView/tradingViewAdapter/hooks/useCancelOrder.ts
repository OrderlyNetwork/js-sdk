import {useCallback} from 'react';
import {useOrderStream} from '@orderly.network/hooks'

export default function useCancelOrder() {
    const [, { cancelOrder, cancelAlgoOrder }] = useOrderStream({});
    return useCallback((order: any) => {
        if (order.algo_order_id) {
            return  cancelAlgoOrder(order.algo_order_id, order.symbol).then();
        }
        cancelOrder(order.order_id, order.symbol).then();

        }, [cancelOrder],
    )
}