import {IBrokerConnectionAdapterHost} from '../type';
import useBroker from '../hooks/useBroker';
import { SideType, AlgoType, OrderCombinationType} from "../type";

const getBrokerAdapter = (host: IBrokerConnectionAdapterHost, broker: ReturnType<typeof useBroker>) => {
    let symbol: string;
    let _symbolInfo: any;
    const getOrderCombinationType = (orderType: any) => {
        return [
            null,
            'limit',
            OrderCombinationType.MARKET,
            OrderCombinationType.STOP_MARKET,
            OrderCombinationType.STOP_LIMIT,
        ][orderType];
    };

    return {
        symbolInfo: async (newSymbol: string): Promise<any> => {
            if (symbol !== newSymbol) {
                symbol = newSymbol;
            }

            _symbolInfo = broker.getSymbolInfo(symbol);

            return {
                qty: {
                    min: _symbolInfo?.baseMin ?? 0,
                    max: _symbolInfo?.baseMax ?? 0,
                    step: _symbolInfo?.baseTick ?? 0,
                },
                pipValue: 0,
                pipSize: _symbolInfo?.quoteTick ?? 0,
                minTick: _symbolInfo?.quoteTick ?? 0,
                description: '',
            };
        },
        placeOrder: async (order: any) => {
            const side = [SideType.SELL, SideType.BUY][+(order.side > 0)];
            const quantity = order.qty.toString();
            const limitPrice = (order.limitPrice ?? 0).toString();
            const triggerPrice = (order.stopPrice ?? 0).toString();
            const symbol = order.symbol;
            const orderCombinationType = getOrderCombinationType(order.type);

            if (orderCombinationType === OrderCombinationType.MARKET) {
                // broker.sendMarketOrder({ side, orderQuantity: quantity, symbol });
            } else if (orderCombinationType === OrderCombinationType.LIMIT) {
                // broker.sendLimitOrder({ side, orderQuantity: quantity, orderPrice: limitPrice, symbol });
            }
        },
        orders: () => [],
        positions: () => [],
        executions: () => [],
        connectionStatus: () => 1,
        chartContextMenuActions: (context: any) => host.defaultContextMenuActions(context),
        isTradable: async () => true,
        accountManagerInfo: () => ({}),
        currentAccount: () => '1',
        accountsMetainfo: async () => [{ id: '1' }],
        remove: () => host?.silentOrdersPlacement().unsubscribe(),
    }
}

export default getBrokerAdapter;