import { API } from "@orderly.network/types";
import { useMemo, useState } from "react";
import { SortDirection, type SortCondition } from "./shared/types";
import { sortFunc } from "./utils";

export const useDataSource = (
  data?: API.MarketInfoExt[]
): [
    API.MarketInfoExt[] | undefined,
    {
      searchKey: string;
      onSearch: (key: string) => void;
      onSort: (key: SortCondition) => void;
    }
  ] => {
  const [searchKey, setSearchKey] = useState<string>("");
  const [sortCondition, setSortCondition] = useState<SortCondition>({});

  const onSearch = (key: string) => {
    setSearchKey(key);
  };

  const onSort = (key: SortCondition) => {
    setSortCondition(key);
  };

  const dataSource = useMemo(() => {
    let formattedData = [...(data ?? [])];
    if (searchKey) {
      formattedData = formattedData?.filter((item) =>
        new RegExp(searchKey, "i").test(item.symbol)
      );
    }

    if (typeof sortCondition.key !== "undefined" && sortCondition.direction !== 0) {

      formattedData?.sort(
        sortFunc[sortCondition.key](
          sortCondition.direction ?? SortDirection.ASC
        )
      );
    }

    return formattedData;
  }, [data, searchKey, sortCondition.key, sortCondition.direction]);

  return [
    dataSource,
    {
      searchKey,
      onSearch,
      onSort,
    },
  ];
};
