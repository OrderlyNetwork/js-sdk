import {useCallback, useEffect, useState } from "react";
import { useQuery } from "../useQuery";

interface MarketInfo {

}

// api: /public/futures
export const useFetures = ()=>{
    const {data,isLoading,error} = useQuery<MarketInfo[]>(`/public/futures`);

    const [sortedData,setSortedData] = useState(data);

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