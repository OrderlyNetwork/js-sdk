import { API } from "@orderly.network/types";
import { usePrivateQuery } from "../usePrivateQuery";

export const useAccountInfo = () => {
  return usePrivateQuery<API.AccountInfo>("/client/info");
};
