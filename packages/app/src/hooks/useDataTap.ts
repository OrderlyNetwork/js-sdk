import { AccountStatusEnum } from "@orderly.network/types";
import { useAppContext } from "../provider/appContext";
import { useAccount } from "@orderly.network/hooks";

export const useDataTap = <T = any>(
  data: T,
  options?: {
    skip?: false;
    fallbackData?: T;
    accountStatus?: AccountStatusEnum;
  }
): T | null => {
  const { wrongNetwork } = useAppContext();
  const { state } = useAccount();
  /**
   * ignore
   */
  if (options?.skip) return data;

  if (wrongNetwork) {
    return typeof options?.fallbackData !== "undefined"
      ? options.fallbackData
      : null;
  }

  if (typeof options?.accountStatus !== "undefined") {
    if (state.status < options.accountStatus) {
      return typeof options?.fallbackData !== "undefined"
        ? options.fallbackData
        : null;
    }
  }

  // return wrongNetwork
  //   ? typeof options?.fallbackData !== "undefined"
  //     ? options.fallbackData
  //     : null
  //   : data;
  //
  return data;
};
