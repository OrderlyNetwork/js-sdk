import { usePrivateInfiniteQuery, usePrivateQuery } from "@orderly.network/hooks"
import { generateKeyFun } from "../utils/swr";
import { useMemo } from "react";
import { API } from "../types/api";

type Params = {
    //** default is 100 */
    size?: number,
    //** YYYY-MM-dd */
    startDate?: string,
    //** YYYY-MM-dd */
    endDate?: string,
    //** default is 1 */
    initialSize?: number,
}

export const useDistribution = (params: Params) : any => {
    const { size = 10, startDate, endDate, initialSize } = params;

    const ordersResponse = usePrivateInfiniteQuery(
        generateKeyFun({ path: '/v1/client/distribution_history', size, startDate, endDate }),
        {
            initialSize: initialSize,
            // revalidateFirstPage: false,
            // onError: (err) => {
            //   console.error("fetch failed::::", err);
            // },
            formatter: (data) => data,
            revalidateOnFocus: false,
        }
    );


    const loadMore = () => {
        ordersResponse.setSize(ordersResponse.size + 1);
    };

    const total = useMemo(() => {
        return ordersResponse.data?.[0]?.meta?.total || 0;
    }, [ordersResponse.data?.[0]?.meta?.total]);


    const flattenOrders = useMemo((): API.Distribution[] | null => {
        if (!ordersResponse.data) {
            return null;
        }

        return ordersResponse.data?.map((item) => item.rows)?.flat();
    }, [ordersResponse.data]);

    return [
        flattenOrders,
        {
            total,
            isLoading: ordersResponse.isLoading,
            refresh: ordersResponse.mutate,
            loadMore
        }
    ] as const;
}