import { useCallback, useEffect, useMemo, useRef } from "react";
import { useConfig, useInfiniteQuery, useQuery } from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { usePagination, useScreen } from "@orderly.network/ui";
import { useEndReached } from "../../../hooks/useEndReached";
import { usePoints } from "../../../hooks/usePointsData";
import { getCurrentAddressRowKey, isSameAddress } from "../shared/util";

export type GeneralRankingData = {
  address: string;
  points?: number;
  rank?: number | string;
  broker_id?: string | number | null;
  key?: string;
};

export type GeneralRankingResponse = {
  meta: API.RecordsMeta;
  rows: Array<{
    rank: number;
    address: string;
    total_points: number;
  }>;
};
export type GeneralRankingScriptReturn = ReturnType<
  typeof useGeneralRankingScript
>;

export type GeneralRankingScriptOptions = {
  address?: string;
};

export function useGeneralRankingScript(options?: GeneralRankingScriptOptions) {
  const { address: searchValue } = options || {};

  const brokerId = useConfig("brokerId");
  const { currentStage, userStatistics, getRankingUrl, selectedTimeRange } =
    usePoints();
  const { isMobile } = useScreen();

  const { page, pageSize, setPage, parsePagination } = usePagination({
    pageSize: 10,
  });

  const { data, isLoading } = useQuery<GeneralRankingResponse>(
    currentStage && brokerId
      ? getRankingUrl({ page, pageSize, timeRange: selectedTimeRange })
      : null,
    {
      formatter: (res) => res,
      revalidateOnFocus: false,
    },
  );

  const {
    data: infiniteData,
    size,
    setSize,
    isValidating,
  } = useInfiniteQuery<GeneralRankingResponse>(
    (pageIndex: number, previousPageData: any): string | null => {
      // reached the end
      if (previousPageData && !previousPageData.rows?.length) return null;
      if (!isMobile || !currentStage) return null;
      return getRankingUrl({
        page: pageIndex + 1,
        pageSize,
        timeRange: selectedTimeRange,
      });
    },
    {
      initialSize: 1,
      formatter: (res) => res,
      revalidateOnFocus: false,
    },
  );

  const userDataList = useMemo(() => {
    if (!userStatistics?.address) return [];

    let rank: number | string = "-";
    let points: number | undefined;

    if (selectedTimeRange === "all_time") {
      rank = userStatistics.stage_rank ?? "-";
      points = userStatistics.stage_points;
    } else if (selectedTimeRange === "this_week") {
      rank = userStatistics.weekly_breakdown?.this_week?.rank ?? "-";
      const breakdown = userStatistics.weekly_breakdown?.this_week;
      points = breakdown
        ? breakdown.trading_point +
          breakdown.pnl_point +
          breakdown.referral_point
        : undefined;
    } else if (selectedTimeRange === "last_week") {
      rank = userStatistics.weekly_breakdown?.last_week?.rank ?? "-";
      const breakdown = userStatistics.weekly_breakdown?.last_week;
      points = breakdown
        ? breakdown.trading_point +
          breakdown.pnl_point +
          breakdown.referral_point
        : undefined;
    }

    return [
      {
        key: getCurrentAddressRowKey(userStatistics.address),
        address: userStatistics.address,
        rank,
        points,
        broker_id: brokerId ?? null,
      },
    ];
  }, [userStatistics, brokerId, selectedTimeRange]);

  const addRankForList = useCallback(
    (list: GeneralRankingData[]) => {
      return list?.map((item, index) => ({
        ...item,
        rank: index + 1 + (page - 1) * pageSize,
      }));
    },
    [page, pageSize],
  );

  const dataSource = useMemo(() => {
    const mapped = (data?.rows || []).map((row) => ({
      address: row.address,
      points: row.total_points,
      rank: row.rank,
      broker_id: brokerId ?? null,
    }));

    const filtered = searchValue
      ? mapped.filter((item) => isSameAddress(item.address, searchValue || ""))
      : mapped;

    const finalList = addRankForList(filtered);
    if (page === 1 && !searchValue && userDataList.length) {
      return [...userDataList, ...finalList];
    }
    return finalList;
  }, [data, brokerId, searchValue, addRankForList, page, userDataList]);

  const dataList = useMemo(() => {
    if (!infiniteData?.length) return [];
    const flat = infiniteData.map((p) => p.rows).flat();
    const mapped = flat.map((row) => ({
      address: row.address,
      points: row.total_points,
      broker_id: brokerId ?? null,
    }));
    const filtered = searchValue
      ? mapped.filter((item) => isSameAddress(item.address, searchValue))
      : mapped;
    const rankList = addRankForList(filtered);
    if (!searchValue && userDataList.length) {
      return [...userDataList, ...rankList];
    }
    return rankList;
  }, [infiniteData, brokerId, searchValue, addRankForList, userDataList]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const pagination = useMemo(
    () =>
      parsePagination({
        total: data?.meta?.total || 0,
        current_page: data?.meta?.current_page || 1,
        records_per_page: pageSize,
      }),
    [data?.meta?.total, data?.meta?.current_page, pageSize],
  );

  useEndReached(sentinelRef, () => {
    if (!isValidating && isMobile) {
      setSize(size + 1);
    }
  });

  useEffect(() => {
    if (searchValue) setPage(1);
  }, [searchValue, setPage]);

  useEffect(() => {
    setPage(1);
  }, [currentStage?.stage_id, setPage]);

  useEffect(() => {
    setPage(1);
    setSize(1); // 重置 infinite query
  }, [selectedTimeRange, setPage, setSize]);

  return {
    pagination,
    dataSource,
    isLoading: isLoading || isValidating,
    isMobile,
    sentinelRef,
    dataList,
    address: userStatistics?.address,
  };
}
