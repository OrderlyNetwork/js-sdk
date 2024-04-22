import { usePrivateInfiniteQuery, usePrivateQuery } from "@orderly.network/hooks"
import { generateKeyFun } from "../utils/swr";
import { useMemo } from "react";
import { API } from "../types/api";
import { format } from "@orderly.network/react";

type Params = {
   //** default Date() - 14d */
   startDate?: Date,
   //** default Date() */
   endDate?: Date
}

export const useRefereeRebateSummary = (params: Params): {
    data?: API.RefereeRebateSummary[],
    mutate: any,
    isLoading: boolean,
} => {
    

    const formatDate = (date: Date): string => {
        return format(date, "yyyy-MM-dd");
    };

    const path = "/v1/referral/referee_rebate_summary";
    const endDate = params?.startDate || new Date();
    const startDate = params?.endDate || new Date(Date.now() - 86400000 * 14);



    const start_date = formatDate(minDate(startDate, endDate));
    const end_date = formatDate(maxDate(startDate, endDate));


    const url = `${path}?start_date=${start_date}&end_date=${end_date}`;
    const {
        data,
        mutate,
        isLoading,
    } = usePrivateQuery<API.RefereeRebateSummary[]>(url, {
        revalidateOnFocus: true
    });

    return {
        data,
        mutate,
        isLoading,
    }
}

function minDate(a: Date, b: Date)  {
    return a < b ? a : b;
}

function maxDate(a: Date, b: Date) {
    return a > b ? a : b;
}