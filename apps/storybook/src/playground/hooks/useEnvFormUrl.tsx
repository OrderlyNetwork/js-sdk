import { useMemo } from "react";
import { useSearchParams } from "react-router";

export type SearchParams = {
  networkId?: string;
  brokerId?: string;
  brokerName?: string;
  env?: string;
  theme?: string;
  usePrivy?: boolean;
};

export function useEnvFormUrl() {
  const [searchParams] = useSearchParams();

  return useMemo(() => {
    const env = searchParams.get("env") || undefined;
    const theme = searchParams.get("theme") || undefined;
    const networkId = searchParams.get("networkId") || undefined;
    const brokerId = searchParams.get("brokerId") || undefined;
    const brokerName = searchParams.get("brokerName") || undefined;
    const usePrivy = searchParams.get("usePrivy") || undefined;
    const amplitudeId = searchParams.get("amplitudeId") || undefined;

    return {
      env,
      networkId,
      brokerId,
      brokerName,
      theme,
      usePrivy: usePrivy !== "false",
      amplitudeId,
    };
  }, [searchParams]);
}
