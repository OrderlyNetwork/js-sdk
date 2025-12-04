import type { API } from "@veltodefi/types";
import { usePrivateQuery } from "../usePrivateQuery";

export const useAccountInfo = () => {
  return usePrivateQuery<API.AccountInfo>("/v1/client/info", {
    revalidateOnFocus: false,
  });
};
