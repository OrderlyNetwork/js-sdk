import {useRef, useEffect, useCallback} from 'react';
import useCancelOrder from '../hooks/useCancelOrder';

const useBroker = ({
                       closeConfirm
                   }: {

    closeConfirm: any;
},) => {
    const cancelOrder = useCancelOrder();
    const closePosition = useCallback((position: any) => closeConfirm && closeConfirm(position), [closeConfirm]);
    const broker = useRef({
        cancelOrder,
        closePosition,
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