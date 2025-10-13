import { useCallback, useEffect, useMemo, useRef } from "react";
import { useAccount, useConfig, useQuery } from "@kodiak-finance/orderly-hooks";
import { useScreen } from "@kodiak-finance/orderly-ui";

export function useCustomRanking(campaignId?: string) {
  const { state } = useAccount();
  const brokerId = useConfig("brokerId");
  const { isMobile } = useScreen();

  const {
    data: rankingDataRes,
    isLoading,
    mutate,
  } = useQuery(
    getUrl({
      page: 1,
      pageSize: 200,
      brokerId,
    }),
    {
      formatter: (res) => res,
      revalidateOnFocus: false,
    },
  );

  const {
    data: userDataRes,
    isLoading: userLoading,
    mutate: mutateUser,
  } = useQuery<any[]>(
    getUrl({
      page: 1,
      pageSize: 1,
      address: state.address,
      brokerId,
    }),
    {
      revalidateOnFocus: false,
    },
  );

  const getAddressRank = useCallback(
    (address: string) => {
      if (rankingDataRes?.rows?.length === 0) {
        return "-";
      }

      const index = rankingDataRes?.rows
        .slice(0, 100)
        .findIndex((item: any) => isSameAddress(item.address, address!));

      return index !== -1 ? index! + 1 : "100+";
    },
    [rankingDataRes],
  );

  const userData = useMemo(() => {
    if (!state.address || userLoading) {
      return undefined;
    }

    const _userData = formatData(userDataRes)?.[0];

    if (!_userData) {
      return {
        key: getCurrentAddressRowKey(state.address!),
        address: state.address,
        rank: "-",
      };
    }

    return {
      ..._userData,
      address: state.address,
      rank: getAddressRank(state.address!),
      key: getCurrentAddressRowKey(state.address!),
    };
  }, [state.address, userDataRes, userLoading, getAddressRank]);

  const dataAdapter = useCallback(
    ({ page, pageSize }: { page: number; pageSize: number }) => {
      const rankList = formatData(rankingDataRes?.rows || []);
      const list = isMobile
        ? rankList
        : rankList.slice((page - 1) * pageSize, page * pageSize);

      const dataList = userData ? [userData, ...list] : list;

      const dataSource = page === 1 ? dataList : list;

      return {
        loading: isLoading || userLoading,
        dataSource,
        dataList,
        userData,
        meta: {
          total: 200,
          current_page: page,
          records_per_page: pageSize,
        },
        updatedTime: new Date("2025-07-04T23:59:59Z").getTime(),
      };
    },
    [rankingDataRes, userData, isLoading, userLoading, isMobile],
  );

  const init = useRef(false);

  useEffect(() => {
    if (campaignId && init.current) {
      mutate();
      mutateUser();
    }
    init.current = true;
  }, [campaignId]);

  return {
    dataAdapter,
  };
}

const getUrl = (args: {
  page: number;
  pageSize: number;
  address?: string;
  sort?: string | null;
  brokerId: string;
}) => {
  const searchParams = new URLSearchParams();

  searchParams.set("page", args.page.toString());
  searchParams.set("size", args.pageSize.toString());
  searchParams.set("aggregateBy", "address_per_builder");
  searchParams.set("broker_id", args.brokerId);
  searchParams.set("sort", "descending_perp_volume");
  searchParams.set("start_date", "2025-06-18");
  searchParams.set("end_date", "2025-07-05");

  if (args.address) {
    searchParams.set("address", args.address);
  }

  return `https://api.orderly.org/v1/broker/leaderboard/daily?${searchParams.toString()}`;
};

function formatData(data: any[] = []) {
  return data?.map((item, index) => ({
    ...item,
    volume: item.perp_volume,
    pnl: item.realized_pnl,
    rank: index + 1,
  }));
}

export function getCurrentAddressRowKey(address: string) {
  return `current-address-${address?.toLowerCase()}`;
}

export function isSameAddress(address1: string, address2: string) {
  return address1.toLowerCase() === address2.toLowerCase();
}

// const addRankForList = (list: any[], page = 1, pageSize = 200) => {
//   return list?.map((item, index) => {
//     let rank: string | number = index + 1;

//     rank = (page - 1) * pageSize + index + 1;

//     return {
//       ...item,
//       rank,
//     };
//   });
// };
