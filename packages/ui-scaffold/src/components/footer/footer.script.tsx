import { useWsStatus, WsNetworkStatus } from "@kodiak-finance/orderly-hooks";

export type FooterReturns = {
  wsStatus: WsNetworkStatus;
};

export const useFooterScript = (): FooterReturns => {
  const wsStatus = useWsStatus();

  return {
    wsStatus,
  };
};
