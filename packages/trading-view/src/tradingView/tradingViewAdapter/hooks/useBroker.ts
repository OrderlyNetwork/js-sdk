import {useRef, useEffect, useCallback} from 'react';
import useCancelOrder from '../hooks/useCancelOrder';
import useEditOrder from './useEditOrder';

const useBroker = ({
                       closeConfirm,
    colorConfig,
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
},) => {
    const cancelOrder = useCancelOrder();
    const editOrder = useEditOrder();
    const closePosition = useCallback((position: any) => closeConfirm && closeConfirm(position), [closeConfirm]);
    const broker = useRef({
        cancelOrder,
        closePosition,
        editOrder,
        colorConfig,
    });

    useEffect(() => {
        broker.current.closePosition = closePosition;
    }, [closeConfirm]);

    useEffect(() => {
        broker.current.cancelOrder = cancelOrder;
    }, [cancelOrder]);

    return broker.current;
};

export default useBroker;