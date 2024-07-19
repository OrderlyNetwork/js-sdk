import { ethers } from "ethers";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getParsedEthersError,
  // @ts-ignore
} from "@enzoferey/ethers-error-parser";
import { getContractByEnv } from "./abis/contrast";
import { toOrder } from "./utils";
import { useGetEnv } from "./useGetEnv";
import { useAccount } from "../useAccount";

export enum DistributionId {
  order = 0,
  esORder = 1,
  mmOrder = 2,
  mmEsOrder = 3,
}

export const useGetClaimed = (
  id: DistributionId
): [
  number | undefined,
  {
    refresh: () => void;
  }
] => {
  const [data, setData] = useState<number | undefined>(0);
  const { account } = useAccount();
  const address = account.address;
  const rpc = useRef<string | undefined>(undefined);
  const provider = useRef<ethers.AbstractProvider | undefined>(undefined);
  const contract = useRef<ethers.Contract | undefined>(undefined);
  const env = useGetEnv();

  useEffect(() => {
    const params = getContractByEnv(env);
    rpc.current = params.orderlyChainRpcUrl;
    provider.current = ethers.getDefaultProvider(rpc.current);
    contract.current = new ethers.Contract(
      params.orderlyContract,
      params.orderlyContractABI,
      provider.current
    );
  }, []);

  const refresh = useCallback(() => {
    if (
      typeof address === "undefined" ||
      typeof rpc.current === "undefined" ||
      typeof provider.current === "undefined" ||
      typeof contract.current === "undefined"
    )
      return;

    console.log(`get claimed(${id})`, [id, address]);

    contract.current["getClaimed"]
      .apply(null, [id, address])
      .catch((error: any) => {
        const parsedEthersError = getParsedEthersError(error);
        throw parsedEthersError;
      })
      .then((res: any) => {
        const resOrder = toOrder(res);
        // const resOrder = toOrder(BigInt(2921867952260000000000));
        console.log(`get claimed(${id})`, resOrder);
        setData(resOrder);
      })
      .catch((error: any) => {});
  }, [address, id, rpc.current, provider.current, contract.current]);

  useEffect(() => {
    refresh();
  }, [rpc.current, id, address]);

  return [data, { refresh }];
};
