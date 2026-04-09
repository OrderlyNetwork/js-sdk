import { useMemo } from "react";
import { useSearchParams } from "react-router";

export type SearchParams = {
  networkId?: string;
  brokerId?: string;
  brokerName?: string;
  env?: string;
  usePrivy?: boolean;
};

export function useEnvFormUrl() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const env = searchParams.get("env") || undefined;
    const networkId = searchParams.get("networkId") || undefined;
    const brokerId = searchParams.get("brokerId") || undefined;
    const brokerName = searchParams.get("brokerName") || undefined;
    const usePrivy = searchParams.get("usePrivy") || undefined;

    return {
      env,
      networkId,
      brokerId,
      brokerName,
      // default true
      usePrivy: usePrivy !== "false",
    };
  }, [searchParams]);
}
