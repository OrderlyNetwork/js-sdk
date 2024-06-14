import { useAssetsHistory } from "@orderly.network/hooks";

export const useDataSource = () => {
  const { data } = useAssetsHistory({});

  return { data };
};
