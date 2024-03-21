import {
    AlgoOrderEntity,
    AlgoOrderType,
    OrderType,
    TriggerPriceType,
    AlgoOrderRootType,
} from "@orderly.network/types";
import {BaseOrderCreator} from "./baseCreator";
import {OrderFormEntity, ValuesDepConfig, VerifyResult} from "./interface";
import {OrderSide} from "@orderly.network/types";
import {API} from "@orderly.network/types";

export class TPSLPositionOrderCreator extends BaseOrderCreator<
    AlgoOrderEntity<AlgoOrderRootType.POSITIONAL_TP_SL>
> {
    create(
        values: AlgoOrderEntity<AlgoOrderRootType.POSITIONAL_TP_SL>
        // config: ValuesDepConfig
    ) {
        const side =
            values.side! === OrderSide.BUY ? OrderSide.SELL : OrderSide.BUY;

        const child_orders = [];

        if (values.tp_trigger_price) {
            child_orders.push({
                algo_type: AlgoOrderType.TAKE_PROFIT,
                reduce_only: true,
                side,
                type: OrderType.CLOSE_POSITION,
                trigger_price: values.tp_trigger_price,
                trigger_price_type: TriggerPriceType.MARK_PRICE,
                symbol: values.symbol,
                is_activated: !!values.tp_trigger_price,
            });
        }

        if (values.sl_trigger_price) {
            child_orders.push({
                algo_type: AlgoOrderType.STOP_LOSS,
                reduce_only: true,
                side,
                type: OrderType.CLOSE_POSITION,
                trigger_price: values.sl_trigger_price,
                trigger_price_type: TriggerPriceType.MARK_PRICE,
                symbol: values.symbol,
                is_activated: !!values.sl_trigger_price,
            });
        }

        return {
            algo_type: AlgoOrderRootType.POSITIONAL_TP_SL,
            trigger_price_type: TriggerPriceType.MARK_PRICE,
            // reduce_only: true,
            symbol: values.symbol,
            child_orders,
        };
    }

    crateUpdateOrder(
        values: AlgoOrderEntity<AlgoOrderRootType.POSITIONAL_TP_SL>,
        /**
         * The old value of the order
         */
        oldValue: API.AlgoOrder
    ) {
        const data = this.create(values);
        const newData: {
            trigger_price?: number;
            order_id: number;
            is_activated?: boolean;
        }[] = [];
        data.child_orders.forEach((order) => {
            // find the old order

            const oldOrder = oldValue.child_orders?.find(
                (oldOrder) => oldOrder.algo_type === order.algo_type
            );

            if (oldOrder) {
                if (!order.is_activated) {
                    newData.push({
                        is_activated: false,
                        order_id: Number(oldOrder.algo_order_id),
                    });
                } else if (oldOrder.trigger_price !== order.trigger_price) {
                    newData.push({
                        trigger_price: order.trigger_price as number,
                        order_id: Number(oldOrder.algo_order_id),
                    });
                }
            }
        });

        return {
            child_orders: newData,
        };
    }

    validate(
        values: OrderFormEntity,
        config: ValuesDepConfig
    ): Promise<VerifyResult> {
        throw new Error("Method not implemented.");
    }
}
