import { useMemo } from "react";
import { useSearchParams } from "react-router";

export type SearchParams = {
  networkId?: string;
  brokerId?: string;
  brokerName?: string;
  env?: string;
};

export function useEnvFormUrl() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const env = searchParams.get("env") || undefined;
    const theme = searchParams.get("theme") || undefined;
    const networkId = searchParams.get("networkId") || undefined;
    const brokerId = searchParams.get("brokerId") || undefined;
    const brokerName = searchParams.get("brokerName") || undefined;

    return {
      env,
      networkId,
      brokerId,
      brokerName,
      theme,
    };
  }, [searchParams]);
}
