import { useQuery } from "../useQuery";

export const useInfo = (symbol:string) => {

  if (!symbol) {
    throw new Error("symbol is required");
  }

  return useQuery(`/public/info/${symbol}`);
};
