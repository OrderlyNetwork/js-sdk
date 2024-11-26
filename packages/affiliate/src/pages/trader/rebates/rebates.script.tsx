import { useMemo, useState } from "react";
import { DateRange } from "../../../utils/types";
import {
  useRefereeRebateSummary,
  RefferalAPI,
  useDaily,
} from "@orderly.network/hooks";
import { useReferralContext } from "../../../hooks";
import { compareDate, formatDateTimeToUTC } from "../../../utils/utils";
import { subDays, toDate } from "date-fns";
import { PaginationMeta, usePagination } from "@orderly.network/ui";

export type RebatesItem = RefferalAPI.RefereeRebateSummary & {
  vol?: number;
};

export const useRebatesScript = () => {
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: subDays(new Date(), 90),
    to: subDays(new Date(), 1),
  });

  const {
    data: distributionData,
    mutate,
    isLoading,
  } = useRefereeRebateSummary({
    startDate: dateRange?.from,
    endDate: dateRange?.to,
  });
  // const { dailyVolume } = useReferralContext();

  const { data: dailyVolume, mutate: dailyVolumeMutate } = useDaily({
    startDate: dateRange?.to,
    endDate: dateRange?.from,
  });

  const dataSource = useMemo((): RebatesItem[] => {
    if (typeof distributionData === "undefined") return [];

    return (
      distributionData
        // .filter((item: any) => item.status === "COMPLETED" && item.type === "REFEREE_REBATE")
        .map((item) => {
          const createdTime = item.date;

          const volume = dailyVolume?.filter((item) => {
            return compareDate(toDate(createdTime), toDate(item.date));
          })?.[0];
          if (volume) {
            return { ...item, vol: volume.perp_volume };
          }

          return item;
        })
    );
  }, [distributionData, dailyVolume]);

  let displayDate = undefined;
  if ((dataSource?.length || 0) > 0) {
    displayDate = formatDateTimeToUTC(dataSource?.[0].date);
  }

  const { page, pageSize, setPage, setPageSize, parseMeta } = usePagination();

  const totalCount = useMemo(() => dataSource.length, [dataSource]);
  // const onPageChange = (page: number) => {
  //   setPage(page);
  // };

  // const onPageSizeChange = (pageSize: number) => {
  //   setPageSize(pageSize);
  // };

  // const newData = useMemo(() => {
  //   const startIndex = (page - 1) * pageSize;
  //   const endIndex = startIndex + pageSize;
  //   return dataSource.slice(startIndex, endIndex);
  // }, [dataSource, page, pageSize]);

  // const meta = parseMeta({
  //   total: totalCount,
  //   current_page: page,
  //   records_per_page: pageSize,
  // });

  const meta = useMemo(() => {
    return parseMeta({
      total: totalCount,
      current_page: page,
      records_per_page: pageSize,
    });
  }, [dataSource, page, pageSize, totalCount]);

  const pagination = useMemo(
    () =>
      ({
        ...meta,
        onPageChange: setPage,
        onPageSizeChange: setPageSize,
      } as PaginationMeta),
    [meta, setPage, setPageSize]
  );

  console.log("pagination", pagination);

  return {
    dateRange,
    setDateRange,
    displayDate,
    dataSource,
    // meta,
    // onPageChange,
    // onPageSizeChange,
    pagination,
    isLoading,
  };
};

export type RebatesReturns = ReturnType<typeof useRebatesScript>;
