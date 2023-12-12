import { Subject } from 'rxjs';

// suject will be used for 3p which doesn't rely on React data flow.
const tickerMap = new Map<string, Subject<any>>();

function getTickers$(symbol: string): Subject<any> {
    if (!tickerMap.has(symbol)) {
        tickerMap.set(symbol, new Subject());
    }

    return tickerMap.get(symbol) as Subject<any>;
}

export default getTickers$;
