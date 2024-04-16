import { usePrivateQuery } from "@orderly.network/hooks";
import { API } from "../types/api";

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

        const year = date.getUTCFullYear();
        const month = String(date.getUTCMonth() + 1).padStart(2, '0');
        const day = String(date.getUTCDate()).padStart(2, '0');

        const formattedTime = `${year}-${month}-${day}`;
        return formattedTime;
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


