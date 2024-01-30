import {useCallback} from 'react';
import {useOrderStream} from '@orderly.network/hooks'

export default function useCancelOrder() {
    const [, { cancelOrder }] = useOrderStream({});
    return useCallback((order: any) => {
        cancelOrder(order.order_id, order.symbol).then();

        }, [cancelOrder],
    )
}