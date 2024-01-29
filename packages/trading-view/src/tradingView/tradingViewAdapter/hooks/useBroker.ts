import {useRef, useEffect} from 'react';
import useCancelOrder from '../hooks/useCancelOrder';

const useBroker = () => {
    const cancelOrder = useCancelOrder();
    const broker = useRef({
        cancelOrder,

    });

    useEffect(() => {
        broker.current.cancelOrder = cancelOrder;
    }, [cancelOrder]);
    return broker.current;
};

export default useBroker;