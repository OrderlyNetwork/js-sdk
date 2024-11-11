import { useWsStatus, WsNetworkStatus } from "@orderly.network/hooks";

export type FooterReturns = {
  wsStatus: WsNetworkStatus;
};

export const useFooterScript = (): FooterReturns => {
  const wsStatus = useWsStatus();

  return {
    wsStatus,
  };
};
