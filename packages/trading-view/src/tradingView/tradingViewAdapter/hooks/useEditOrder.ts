import {useCallback} from 'react';
import {useOrderStream} from '@orderly.network/hooks'
import {OrderStatus} from '@orderly.network/types';
import {Decimal} from '@orderly.network/utils';

export default function useEditOrder() {
    const [, {updateOrder}] = useOrderStream({status: OrderStatus.INCOMPLETE});
    return useCallback((order: any, lineValue: any) => {
            const values = {
                order_price: order.price?.toString(),
                order_quantity: order.quantity.toString(),
                symbol: order.symbol,
                order_type: order.type,
                side: order.side,
                reduce_only: Boolean(order.reduce_only),
            }
            if (lineValue.type === 'price') {
                values.order_price = new Decimal(lineValue.value).toString();

            }
            return updateOrder(order.order_id, values).then();

        }, [updateOrder],
    )
}