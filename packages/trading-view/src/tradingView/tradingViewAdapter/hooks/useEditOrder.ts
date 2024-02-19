import {useCallback} from 'react';
import {useOrderStream} from '@orderly.network/hooks'
import {OrderStatus} from '@orderly.network/types';
import {Decimal} from '@orderly.network/utils';

export default function useEditOrder() {
    const [, {updateOrder, cancelAlgoOrder, updateAlgoOrder}] = useOrderStream({status: OrderStatus.INCOMPLETE});
    return useCallback((order: any, lineValue: any) => {
            if (order.algo_order_id) {
                const values = {

                    quantity: order.quantity,
                    trigger_price: order.trigger_price,
                    symbol: order.symbol,
                    price: order.price,
                    // order_type: order.type,
                    // side: order.side,
                    // reduce_only: Boolean(order.reduce_only),
                    algo_order_id: order.algo_order_id,
                }
                if (lineValue.type === 'price') {
                    values.price= new Decimal(lineValue.value).toString();
                }
                if (lineValue.type === 'trigger_price') {
                    values.trigger_price = new Decimal(lineValue.value).toString();
                }
                // @ts-ignore
                return updateAlgoOrder(order.algo_order_id, values)

            }
            const values: any = {
                order_price: order.price?.toString(),
                order_quantity: order.quantity.toString(),
                symbol: order.symbol,
                order_type: order.type,
                side: order.side,
                visible_quantity: 0,
                reduce_only: order.reduce_only,
            }
            if (new Decimal(order.visible_quantity).eq(order.quantity)) {

                delete values.visible_quantity;
            }
            if (!Object.keys(order).includes('reduce_only')) {

                delete values.reduce_only;
            }
            if (lineValue.type === 'price') {
                values.order_price = new Decimal(lineValue.value).toString();

            }
            return updateOrder(order.order_id, values).then();

        }, [updateOrder],
    )
}