import { useMemo } from "react";
import { useSearchParams } from "react-router";
import {
  parseWalletMode,
  type WalletMode,
} from "../../components/orderlyProvider/walletMode";

export type SearchParams = {
  networkId?: string;
  brokerId?: string;
  brokerName?: string;
  env?: string;
  walletMode: WalletMode;
};

export function useEnvFormUrl() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const env = searchParams.get("env") || undefined;
    const networkId = searchParams.get("networkId") || undefined;
    const brokerId = searchParams.get("brokerId") || undefined;
    const brokerName = searchParams.get("brokerName") || undefined;
    const walletMode = parseWalletMode(searchParams.get("walletMode"));

    return {
      env,
      networkId,
      brokerId,
      brokerName,
      walletMode,
    };
  }, [searchParams]);
}
