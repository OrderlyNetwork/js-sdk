import {useRef, useEffect, useCallback, useMemo} from 'react';
import useCancelOrder from '../hooks/useCancelOrder';
import useEditOrder from './useEditOrder';
import useSenderOrder from './useSendOrder';
import {useSymbolsInfo} from '@orderly.network/hooks';

const useBroker = ({
                       closeConfirm,
                       colorConfig,
    onToast,
                   }: {

    closeConfirm: any;
    colorConfig: {
        chartBG: string;
        upColor: string;
        downColor: string,
        pnlUpColor: string;
        pnlDownColor: string;
        textColor: string;
        qtyTextColor: string;
        font: string;

    },
    onToast?: any,
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