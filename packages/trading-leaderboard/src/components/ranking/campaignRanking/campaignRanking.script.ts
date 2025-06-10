import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useAccount,
  useConfig,
  useInfiniteQuery,
  useQuery,
} from "@orderly.network/hooks";
import { API } from "@orderly.network/types";
import { TableSort, usePagination, useScreen } from "@orderly.network/ui";
import { useEndReached } from "../../../hooks/useEndReached";
import { CampaignConfig, UserData } from "../../campaigns/type";
import { useTradingLeaderboardContext } from "../../provider";
import { calculateEstimatedRewards } from "../../rewards/utils";
import { getCurrentAddressRowKey, isSameAddress } from "../shared/util";

export type CampaignRankingData = {
  broker_id: string;
  account_id: string;
  address: string;
  volume: number;
  pnl: number;
  total_deposit_amount: number;
  total_withdrawal_amount: number;
  start_account_value: number;
  end_account_value: number;

  // custom field
  key?: string;
  rank?: number | string;
};

type CampaignRankingResponse = {
  meta: API.RecordsMeta;
  rows: CampaignRankingData[];
  updated_time: number;
};
export type CampaignRankingScriptReturn = ReturnType<
  typeof useCampaignRankingScript
>;

export type CampaignRankingScriptOptions = {
  campaignId: number | string;
  sortKey?: "volume" | "pnl";
};

export function useCampaignRankingScript(
  options: CampaignRankingScriptOptions,
) {
  const { campaignId, sortKey = "volume" } = options;
  const [initialSort] = useState<TableSort>({
    sortKey,
    sort: "desc",
  });
  const [sort, setSort] = useState<TableSort | undefined>(initialSort);

  const { currentCampaign, setUserData, setUpdatedTime } =
    useTradingLeaderboardContext();

  const { state } = useAccount();
  const brokerId = useConfig("brokerId");

  const { isMobile } = useScreen();

  const { page, pageSize, setPage, parsePagination } = usePagination({
    pageSize: 20,
  });

  const getUrl = (args: {
    page: number;
    pageSize: number;
    sort?: string | null;
  }) => {
    const searchParams = new URLSearchParams();

    searchParams.set("page", args.page.toString());
    searchParams.set("size", args.pageSize.toString());

    if (campaignId) {
      searchParams.set("campaign_id", campaignId.toString());
    }

    if (brokerId) {
      searchParams.set("broker_id", brokerId);
    }

    if (args.sort) {
      searchParams.set("sort_by", args.sort);
    } else if (args.sort !== null && sort) {
      searchParams.set("sort_by", sort.sortKey);
    }

    // https://orderly.network/docs/build-on-omnichain/evm-api/restful-api/public/get-campaign-ranking
    // only get prod ranking data
    return `https://api.orderly.org/v1/public/campaign/ranking?${searchParams.toString()}`;
  };

  const { data, isLoading } = useQuery<CampaignRankingResponse>(
    getUrl({ page, pageSize }),
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
  } = useInfiniteQuery<CampaignRankingResponse>(
    (pageIndex: number, previousPageData: any): string | null => {
      // reached the end
      if (previousPageData && !previousPageData.rows?.length) return null;

      if (!isMobile) {
        return null;
      }

      return getUrl({
        page: pageIndex + 1,
        pageSize,
      });
    },
    {
      initialSize: 1,
      formatter: (res) => res,
      revalidateOnFocus: false,
    },
  );

  // it will use first page data cache
  const { data: top100Data } = useQuery<CampaignRankingResponse>(
    state.address
      ? getUrl({
          page: 1,
          pageSize: 100,
          // sort: "desc",
        })
      : null,
    {
      formatter: (res) => res,
      revalidateOnFocus: false,
    },
  );

  const getUserUrl = () => {
    if (!state.address || !campaignId) {
      return null;
    }

    const searchParams = new URLSearchParams();

    if (brokerId) {
      searchParams.set("broker_id", brokerId);
    }

    searchParams.set("campaign_id", campaignId.toString());
    searchParams.set("address", state.address!);

    // https://orderly.network/docs/build-on-omnichain/evm-api/restful-api/public/get-campaign-user-info
    // only get prod user data
    return `https://api.orderly.org/v1/public/campaign/user?${searchParams.toString()}`;
  };

  const { data: userDataRes } = useQuery<CampaignRankingData[]>(getUserUrl(), {
    revalidateOnFocus: false,
  });

  const getAddressRank = useCallback(
    (address: string) => {
      const index = top100Data?.rows.findIndex((item) =>
        isSameAddress(item.address, address!),
      );
      return index !== -1 ? index! + 1 : "100+";
    },
    [top100Data],
  );

  const userData = useMemo(() => {
    if (!state.address || isLoading) {
      return undefined;
    }

    if (!userDataRes) {
      return {
        key: getCurrentAddressRowKey(state.address!),
        address: state.address,
        rank: "-",
      } as unknown as CampaignRankingData;
    }

    return {
      ...userDataRes,
      address: state.address,
      rank: getAddressRank(state.address!),
      key: getCurrentAddressRowKey(state.address!),
    };
  }, [state.address, userDataRes, isLoading, getAddressRank]);

  const addRankForList = useCallback(
    (list: CampaignRankingData[], total: number) => {
      return list?.map((item, index) => {
        let rank: string | number = index + 1;

        if (sort?.sort === "asc") {
          rank = total - (page - 1) * pageSize - index;
        } else if (sort?.sort === "desc") {
          rank = (page - 1) * pageSize + index + 1;
        }

        return {
          ...item,
          rank,
        };
      });
    },
    [page, pageSize, sort],
  );

  const dataSource = useMemo(() => {
    const list = data?.rows || [];
    const total = data?.meta.total || 0;
    const rankList = addRankForList(list, total);
    const _data =
      page === 1 ? (userData ? [userData, ...rankList] : rankList) : rankList;

    return formatData(_data, currentCampaign);
  }, [data, page, userData, addRankForList, currentCampaign]);

  const dataList = useMemo(() => {
    if (!infiniteData?.length) {
      return [];
    }

    const total = infiniteData[0]?.meta.total || 0;
    const flatList = infiniteData?.map((item) => item.rows)?.flat();
    const rankList = addRankForList(flatList, total);

    const _data = userData ? [userData, ...rankList] : rankList;

    return formatData(_data, currentCampaign);
  }, [infiniteData, userData, addRankForList, currentCampaign]);

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const pagination = useMemo(
    () => parsePagination(data?.meta),
    [parsePagination, data],
  );

  useEndReached(sentinelRef, () => {
    if (!isValidating && isMobile) {
      setSize(size + 1);
    }
  });

  useEffect(() => {
    setPage(1);
  }, [state.address]);

  useEffect(() => {
    if (userData) {
      setUserData?.(userData as any);
    }
  }, [userData]);

  useEffect(() => {
    setUpdatedTime?.(data?.updated_time || 0);
    // when currentCampaign changed, we need to reset the snapshot time
  }, [data, currentCampaign]);

  return {
    pagination,
    initialSort,
    dataSource,
    isLoading: isLoading || isValidating,
    isMobile,
    sentinelRef,
    dataList,
    address: state.address,
  };
}

function formatData(data: any[], currentCampaign?: CampaignConfig) {
  return data.map((item) => ({
    ...item,
    rewards:
      currentCampaign &&
      calculateEstimatedRewards(item as UserData, currentCampaign!),
  }));
}
