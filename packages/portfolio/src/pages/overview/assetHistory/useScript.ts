import { useAssetsHistory } from "@orderly.network/hooks";

const useAssetHistoryHook = () => {
  const [data, { meta }] = useAssetsHistory({});

  return {
    dataSource: data,
    page: meta?.current_page,
    total: meta?.total,
    pageSize: meta.records_per_page,
  };
};

export { useAssetHistoryHook };
