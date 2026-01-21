import { useCallback, useMemo, useState } from "react";
import { subDays, format } from "date-fns";
import { useAccount, usePrivateQuery } from "@orderly.network/hooks";
import { AccountStatusEnum } from "@orderly.network/types";
import {
  usePagination,
  TableSort,
  modal,
  useScreen,
} from "@orderly.network/ui";
import { useReferralHistory } from "../../../../hooks/useReferralHistory";
import { useReferralContext } from "../../../../provider";
import { ReferralCodeFormType } from "../../../../types";
import { DateRange } from "../../../../utils/types";
import { ReferralCodeFormDialogId } from "../referralCodeForm/modal";

export type CommissionDataType = {
  date: string;
  code: string;
  volume: number;
  commission: number;
  address: string;
};

export type RefereeDataType = {
  account_id: string;
  address: string;
  bind_code: string;
  bind_type: string;
  code_binding_time: number;
  is_default_rate: boolean;
  referral_rebate_rate: number;
  referee_rebate_rate: number;
  direct_rebate: number;
  indirect_rebate: number;
  network_size: number;
  volume: number;
  commission: number;
  direct_invites: number;
  indirect_invites: number;
  direct_volume: number;
  indirect_volume: number;
};

type RefereesSortableKey =
  | "referee_rebate_rate"
  | "network_size"
  | "volume"
  | "commission";

type RefereePaginationMeta = {
  total: number;
  current_page: number;
  records_per_page: number;
};

export const useReferrerTableScript = () => {
  const [activeTab, setActiveTab] = useState("commission");
  const [dateRange, setDateRange] = useState<DateRange>({
    from: subDays(new Date(), 30),
    to: new Date(),
  });
  const { isMobile } = useScreen();

  const { page, pageSize, parsePagination, setPage } = usePagination();

  // ----- Commission Tab Logic -----
  const [sort, setSort] = useState<{
    key: keyof CommissionDataType;
    order: "asc" | "desc";
  } | null>(null);

  const { state } = useAccount();

  const [data, { meta, isLoading: isDataLoading }] = useReferralHistory({
    startDate: dateRange.from
      ? format(dateRange.from, "yyyy-MM-dd")
      : undefined,
    endDate: dateRange.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    page: isMobile ? undefined : page,
    size: isMobile ? undefined : pageSize,
    fetchAll: isMobile,
  });

  const pagination = useMemo(() => {
    return parsePagination(meta);
  }, [meta, parsePagination]);

  // Process data (Filter & Sort)
  const processedData = useMemo(() => {
    if (!data) return [];

    const rows: CommissionDataType[] = data.map((row) => ({
      date: row.date,
      code: row.referral_code,
      volume: row.volume,
      commission: row.referral_rebate,
      address: row.user_address,
    }));

    if (sort) {
      rows.sort((a, b) => {
        const valA = a[sort.key];
        const valB = b[sort.key];
        if (valA < valB) return sort.order === "asc" ? -1 : 1;
        if (valA > valB) return sort.order === "asc" ? 1 : -1;
        return 0;
      });
    }
    return rows;
  }, [data, sort]);

  const onSort = (sort?: TableSort) => {
    if (!sort) {
      setSort(null);
      return;
    }
    const sortKey = sort.sortKey as keyof CommissionDataType;
    if (sortKey && (sortKey === "volume" || sortKey === "commission")) {
      setSort({
        key: sortKey,
        order: sort.sort === "asc" ? "asc" : "desc",
      });
    }
  };

  const onPageChange = (newPage: number) => {
    setPage(newPage);
  };

  // ----- Referees Tab Logic -----
  const refereesPaginationUtils = usePagination();
  const [refereesSort, setRefereesSort] = useState<{
    key: RefereesSortableKey;
    order: "asc" | "desc";
  } | null>(null);

  const {
    data: refereesRawData,
    isLoading: isRefereesLoading,
    mutate: refereesMutate,
  } = usePrivateQuery<{
    rows?: RefereeDataType[];
    data?: { rows?: RefereeDataType[]; meta?: RefereePaginationMeta };
    success?: boolean;
    timestamp?: number;
    meta?: RefereePaginationMeta;
  }>(
    state.status >= AccountStatusEnum.EnableTrading && activeTab === "referees"
      ? isMobile
        ? "/v1/referral/multi_level/referee_list"
        : `/v1/referral/multi_level/referee_list?page=${refereesPaginationUtils.page}&size=${refereesPaginationUtils.pageSize}`
      : null,
    {
      formatter: (response) => {
        const rows = response.rows ?? response.data?.rows ?? [];
        const meta = response.meta ?? response.data?.meta;
        return {
          ...response,
          meta,
          rows: rows.map((row: RefereeDataType) => ({
            ...row,
            network_size: row.direct_invites + row.indirect_invites,
            volume: row.direct_volume + row.indirect_volume,
            commission: row.direct_rebate + row.indirect_rebate,
          })),
        };
      },
      revalidateOnFocus: false,
    },
  );

  const refereesPagination = useMemo(() => {
    return refereesPaginationUtils.parsePagination(refereesRawData?.meta);
  }, [refereesRawData, refereesPaginationUtils]);

  const { multiLevelRebateInfo, maxRebateRate, multiLevelRebateInfoMutate } =
    useReferralContext();

  const onEditReferee = useCallback(
    (type: ReferralCodeFormType, item: RefereeDataType) => {
      const referrerRebateRate =
        type === ReferralCodeFormType.Reset
          ? multiLevelRebateInfo?.referrer_rebate_rate
          : item.referral_rebate_rate;

      modal.show(ReferralCodeFormDialogId, {
        type,
        referralCode: multiLevelRebateInfo?.referral_code,
        maxRebateRate,
        referrerRebateRate,
        onSuccess: () => {
          multiLevelRebateInfoMutate();
          refereesMutate();
        },
        accountId: item.account_id,
      });
    },
    [multiLevelRebateInfo, maxRebateRate, multiLevelRebateInfoMutate],
  );

  const processedRefereesData = useMemo(() => {
    const rows = refereesRawData?.rows ?? [];
    if (!refereesSort) return rows;

    const sortableRows = rows.map((row, index) => ({
      row,
      index,
    }));

    sortableRows.sort((a, b) => {
      const valA = Number(a.row[refereesSort.key] ?? 0);
      const valB = Number(b.row[refereesSort.key] ?? 0);
      if (valA < valB) return refereesSort.order === "asc" ? -1 : 1;
      if (valA > valB) return refereesSort.order === "asc" ? 1 : -1;
      return a.index - b.index;
    });

    return sortableRows.map((item) => item.row);
  }, [refereesRawData, refereesSort]);

  const onRefereesSort = (sort?: TableSort) => {
    if (!sort) {
      setRefereesSort(null);
      return;
    }
    const sortKey = sort.sortKey as RefereesSortableKey;
    if (
      sortKey &&
      (sortKey === "referee_rebate_rate" ||
        sortKey === "network_size" ||
        sortKey === "volume" ||
        sortKey === "commission")
    ) {
      setRefereesSort({
        key: sortKey,
        order: sort.sort === "asc" ? "asc" : "desc",
      });
    }
  };

  return {
    activeTab,
    setActiveTab,
    commissionData: processedData,
    dateRange,
    setDateRange,
    pagination,
    onSort,
    onPageChange,
    isLoading: state.status < AccountStatusEnum.EnableTrading || isDataLoading,

    // Referees props
    refereesData: processedRefereesData,
    refereesPagination,
    isRefereesLoading:
      state.status < AccountStatusEnum.EnableTrading || isRefereesLoading,
    onEditReferee,
    onRefereesSort,
  };
};

export type ReferrerTableScriptReturns = ReturnType<
  typeof useReferrerTableScript
>;
