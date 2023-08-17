import { useQuery } from "../useQuery";
import { type API } from "@orderly/core";

export const useToken = () => {
  return useQuery<API.Token[]>("/public/token");
};
