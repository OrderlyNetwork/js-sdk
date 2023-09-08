import { usePrivateQuery } from "../usePrivateQuery";

export const useTradeStream = () => {
  const { data, isLoading } = usePrivateQuery("/v1/trades");

  return [data, { isLoading }];
};
