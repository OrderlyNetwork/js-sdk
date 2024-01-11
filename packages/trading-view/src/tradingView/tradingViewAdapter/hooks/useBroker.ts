import {useRef} from 'React';
import useCancelOrder from '../hooks/useCancelOrder';

const useBroker = () => {
    const cancelOrder = useCancelOrder();
    const broker = useRef({
        cancelOrder,

    });
};

export default useBroker;