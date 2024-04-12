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

export const useRefereeInfo = (params: Params): any[] => {
    const { size = 10, startDate, endDate, initialSize } = params;

    const response = usePrivateInfiniteQuery(
        generateKeyFun({ path: '/v1/referral/referee_info', size, startDate, endDate }),
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
        response.setSize(response.size + 1);
    };

    const total = useMemo(() => {
        return response.data?.[0]?.meta?.total || 0;
    }, [response.data?.[0]?.meta?.total]);


    const flattenOrders = useMemo((): API.RefereeInfoItem[] | null => {
        if (!response.data) {
            return null;
        }

        return response.data?.map((item) => item.rows)?.flat();
    }, [response.data]);

    return [
        flattenOrders,
        {
            total,
            isLoading: response.isLoading,
            refresh: response.mutate,
            loadMore
        }
    ] as const;
}