import {useCallback, useEffect, useState } from "react";
import { useQuery } from "../useQuery";
import { useWebSocketClient } from "../useWebSocketClient";
import {type WS } from "@orderly/core";


interface MarketInfo {

}

// api: /public/futures
export const useFetures = ()=>{
    const {data,isLoading,error} = useQuery<MarketInfo[]>(`/public/futures`);

    const [sortedData,setSortedData] = useState(data);

    const ws = useWebSocketClient();

    useEffect(() => {
        const sub = ws.observe<WS.Ticker>(`tickers`).subscribe((value) => {
            console.log("useTickers", value);
            // setData(value);
        });

        return () => {
            sub.unsubscribe();
        };
    }, []);

    useEffect(() => {
        if(data){
            const sortedData = data.sort((a,b)=>{
                return 0;
            });
            setSortedData(sortedData);
        }
    }, [data]);

    const sortBy = useCallback((key:string)=>{

    },[data]);

    const filterBy = useCallback((key:string)=>{

    },[data]);

    return {
        // ...data,
        data:sortedData,
        sortBy,
        filterBy,
        isLoading,
        error,
    }
}