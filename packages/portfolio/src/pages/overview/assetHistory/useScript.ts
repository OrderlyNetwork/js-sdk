import { useState } from "react";
import {
  AssetHistoryStatusEnum,
  useAssetsHistory,
} from "@orderly.network/hooks";

type FilterParams = {
  token?: string;
  side?: string;
  status?: AssetHistoryStatusEnum;
  startTime?: string;
  endTime?: string;
};

const useAssetHistoryHook = () => {
  const [fileter, setFilter] = useState<FilterParams>({});

  const [data, { meta }] = useAssetsHistory(fileter);

  const onSearch = (filter: FilterParams) => {
    setFilter((prevState) => ({
      ...prevState,
      ...filter,
    }));
  };

  return {
    dataSource: data,
    page: meta?.currentPage,
    total: meta?.total,
    // pageSize: meta.,
    onSearch,
  };
};

export { useAssetHistoryHook };
