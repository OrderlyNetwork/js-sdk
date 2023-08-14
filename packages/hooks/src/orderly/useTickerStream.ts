import {useEffect, useState } from "react";
import { useQuery } from "../useQuery";
import { useWebSocketClient } from "../useWebSocketClient";

type TickerValue = {
    symbol: string;
    open:   number;
    close:  number;
    high:   number;
    low:    number;
    volume: number;
    amount: number;
    count:  number;
}

export const useTickerStream = (symbol: string) => {
    const [data, setData] = useState<TickerValue|null>(null);
    if(!symbol) {
        throw new Error("useFuturesForSymbol requires a symbol");
    }

    const ws = useWebSocketClient();

    useEffect(() => {
        const sub = ws.observe<TickerValue>(`${symbol}@ticker`).subscribe((value) => {
            console.log("useTicker", value);
            setData(value);
        });

        return () => {
            sub.unsubscribe();
        }
    }, []);

    // return useQuery(`/public/futures/${symbol}`);
    return {data}
}