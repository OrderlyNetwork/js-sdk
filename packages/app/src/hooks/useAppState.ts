import { useMemo } from "react";
import { useAccount, useConfig, useChains } from "@orderly.network/hooks";
import {
  AccountStatusEnum,
  NetworkId,
  NetworkStatusEnum,
} from "@orderly.network/types";

export const useAppState = (): {
  wrongNetwork: boolean;
  networkStatus: NetworkStatusEnum;
} => {
  // const keyStore = useKeyStore();
  const config = useConfig();
  const networkId = config.get("networkId");
  const [_, { checkSupportedChain }] = useChains();
  const { account, state } = useAccount();
  // restore account state
  // useEffect(() => {
  //   console.log("current address:", keyStore.getAddress());
  // }, []);

  const networkStatus = useMemo(() => {
    if (
      state.status < AccountStatusEnum.Connected ||
      typeof account.chainId !== "number"
    )
      return NetworkStatusEnum.unknown;

    return checkSupportedChain(account.chainId, networkId as NetworkId)
      ? NetworkStatusEnum.supported
      : NetworkStatusEnum.unsupported;
  }, [networkId, state.status]);

  return {
    wrongNetwork: networkStatus === NetworkStatusEnum.unsupported,
    networkStatus,
  };
};
