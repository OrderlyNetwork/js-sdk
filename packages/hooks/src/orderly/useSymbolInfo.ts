import { useQuery } from "../useQuery";

export const useSymbolInfo = (symbol: string) => {
  const { data } = useQuery(`/public/info`);
  return {};
};
