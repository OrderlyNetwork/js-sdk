import { useWsStatus, WsNetworkStatus } from "@veltodefi/hooks";

export type FooterReturns = {
  wsStatus: WsNetworkStatus;
};

export const useFooterScript = (): FooterReturns => {
  const wsStatus = useWsStatus();

  return {
    wsStatus,
  };
};
