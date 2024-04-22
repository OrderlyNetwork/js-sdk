import { usePrivateQuery } from "@orderly.network/hooks";
import { API } from "../types/api";
import { format } from "@orderly.network/react";

export const useDaily = (options?: {
    //** default Date() - 30d */
    startDate?: Date,
    //** default Date() */
    endDate?: Date
}): {
    data?: API.DayliVolume[],
    mutate: any,
} => {


    const formatDate = (date: Date): string => {
        return format(date, "yyyy-MM-dd");
    };

    const path = "/v1/volume/user/daily";
    const endDate = options?.startDate || new Date();
    const startDate = options?.endDate || new Date(Date.now() - 86400000 * 30);

    const start_date = formatDate(startDate);
    const end_date = formatDate(endDate);

    const url = `${path}?start_date=${start_date}&end_date=${end_date}`;
    const {
        data: dailyVolume,
        mutate,
    } = usePrivateQuery<API.DayliVolume[]>(url, {
        revalidateOnFocus: true
    });

    return {
        data: dailyVolume,
        mutate,
    }
}


