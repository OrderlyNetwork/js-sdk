import { useSymbolContext } from "@/provider/symbolProvider";
import { useOrderStream } from "@orderly.network/hooks";
import { OrderStatus } from "@orderly.network/types";
import { useMemo } from "react";

export const usePendingOrderStream = (symbol: string): number[] => {

    const [data] = useOrderStream({
        status: OrderStatus.INCOMPLETE,
        symbol: symbol
    });


    const pendingOrders = useMemo(() => {
        const info = data?.filter((item) => item.symbol === symbol).reduce((a, b) => {
            return ([...a, b.price]);
        }, []);

        
        return info;
    }, [data, symbol]);
    
    return pendingOrders;
}