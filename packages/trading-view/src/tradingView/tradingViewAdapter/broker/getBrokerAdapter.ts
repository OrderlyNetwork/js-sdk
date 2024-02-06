import {IBrokerConnectionAdapterHost} from '../type';
import useBroker from '../hooks/useBroker';

const getBrokerAdapter = (host: IBrokerConnectionAdapterHost, broker: ReturnType<typeof useBroker>) => {
    return {
        positions: () => [],
        remove: () => host?.silentOrdersPlacement().unsubscribe(),
    }
}

export default getBrokerAdapter;