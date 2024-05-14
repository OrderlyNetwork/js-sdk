import {useRef, useEffect, useCallback, useMemo} from 'react';
import useCancelOrder from '../hooks/useCancelOrder';
import useEditOrder from './useEditOrder';
import useSenderOrder from './useSendOrder';
import {useSymbolsInfo} from '@orderly.network/hooks';
import { ChartMode, ColorConfigInterface } from '../type';

const useBroker = ({
                       closeConfirm,
                       colorConfig,
    onToast,
    mode,
                   }: {

    closeConfirm: any;
    colorConfig: ColorConfigInterface,
    onToast?: any,
    mode?: ChartMode,
},) => {
    const cancelOrder = useCancelOrder();
    const editOrder = useEditOrder(onToast);
    const symbolData = useSymbolsInfo();
    const closePosition = useCallback((position: any) => closeConfirm && closeConfirm(position), [closeConfirm]);
    const {sendLimitOrder} = useSenderOrder();

    const getSymbolInfo = useCallback((symbol: string) => {
        if (!symbolData) {
           return;
        }
       return {
           baseMin: symbolData[symbol]('base_min'),
           baseMax: symbolData[symbol]('base_max'),
           baseTick: symbolData[symbol]('base_tick'),
           quoteTick: symbolData[symbol]('quote_tick'),
       }

    }, [symbolData]);
    const broker = useRef({
        cancelOrder,
        closePosition,
        editOrder,
        colorConfig,
        sendLimitOrder,
        getSymbolInfo,
        mode,
    });


    useEffect(() => {
        broker.current.getSymbolInfo = getSymbolInfo;
    }, [symbolData]);

    useEffect(() => {
        broker.current.sendLimitOrder = sendLimitOrder;

    }, [sendLimitOrder]);

    useEffect(() => {
        broker.current.closePosition = closePosition;
    }, [closeConfirm]);

    useEffect(() => {
        broker.current.cancelOrder = cancelOrder;
    }, [cancelOrder]);

    return broker.current;
};

export default useBroker;